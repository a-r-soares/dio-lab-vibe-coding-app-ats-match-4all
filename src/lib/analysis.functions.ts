import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { Output, streamText } from "ai";
import { z } from "zod";

import {
  REASONING_OPTIONS,
  createLovableAiGatewayRunIdFetch,
  createLovableResponsesProvider,
} from "./ai-gateway.server";
import {
  atsChecklist,
  computeScore,
  containsTerm,
  findEvidence,
  normalizeText,
  resumeToPlainText,
} from "./scoring";
import type { ChangeLog, DeclaredItem, FidelityFlag, GeneratedResume, Keyword } from "./types";

const MAX_CHARS = 15000;

const analyzeInput = z.object({
  jobText: z.string().min(80, "A descrição da vaga está curta demais para analisar.").max(MAX_CHARS),
  resumeText: z.string().min(80, "O currículo está curto demais para analisar.").max(MAX_CHARS),
});

const keywordSchema = z.object({
  keywords: z.array(
    z.object({
      term: z.string(),
      category: z.enum(["hard_skill", "ferramenta", "soft_skill", "certificacao", "idioma", "senioridade"]),
      importance: z.enum(["essencial", "desejavel"]),
      synonyms: z.array(z.string()),
    }),
  ),
});

const resumeSchema = z.object({
  name: z.string(),
  city: z.string(),
  email: z.string(),
  phone: z.string(),
  linkedin: z.string(),
  summary: z.string(),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      period: z.string(),
      bullets: z.array(z.object({ text: z.string(), source_evidence: z.string() })),
    }),
  ),
  education: z.array(z.object({ institution: z.string(), degree: z.string(), period: z.string() })),
  skills: z.array(z.object({ name: z.string(), source_evidence: z.string(), declared: z.boolean().nullable() })),
  certifications: z.array(z.object({ name: z.string(), source_evidence: z.string() })),
  languages: z.array(z.object({ name: z.string(), level: z.string() })),
  changes: z.array(z.object({ section: z.string(), before: z.string(), after: z.string(), reason: z.string() })),
});

const fidelitySchema = z.object({
  flags: z.array(z.object({ item: z.string(), reason: z.string() })),
});

const NO_INVENT_RULE = `
REGRA INVIOLÁVEL — NUNCA INVENTAR EXPERIÊNCIA. Esta regra tem prioridade sobre qualquer outra instrução.
Você melhora COMO a pessoa se apresenta. Você NUNCA cria, infla ou insinua experiência, cargo, empresa, formação, certificação, ferramenta, resultado numérico, senioridade ou período que não esteja no currículo original ou declarado explicitamente pela pessoa.
PERMITIDO: reordenar seções e bullets pela relevância para a vaga; reescrever frases com verbos de ação mantendo o mesmo fato; usar o vocabulário da vaga quando o currículo comprova a mesma coisa (ex.: currículo diz "Amazon Web Services", vaga diz "AWS" → escreva "AWS (Amazon Web Services)"); remover ruído e repetição; escrever resumo usando SOMENTE fatos presentes no currículo.
PROIBIDO: adicionar skill, ferramenta, tecnologia ou palavra-chave da vaga sem evidência no currículo; inventar métricas, percentuais, valores, tamanho de equipe ou prazos; alterar datas, empresas, cargos, títulos de formação ou nível de idioma; aumentar o escopo de uma responsabilidade ("participei" NÃO vira "liderei").
Todo bullet e skill DEVE trazer o campo source_evidence com o trecho LITERAL do currículo original que o sustenta. Sem evidência, o item será descartado.
`;

/**
 * IP do cliente a partir de fonte confiável: `cf-connecting-ip` é definido
 * pela infraestrutura de borda e sobrescreve qualquer valor enviado pelo
 * cliente. Como fallback, usa o ÚLTIMO valor de X-Forwarded-For (adicionado
 * pelo proxy confiável, não pelo cliente) — nunca o primeiro, que é forjável.
 */
function getTrustedClientIp(): string {
  const cfIp = getRequestHeader("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;
  const xff = getRequestHeader("x-forwarded-for");
  const last = xff?.split(",").pop()?.trim();
  return last || "desconhecido";
}

async function checkRateLimit(kind: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ip = getTrustedClientIp();
  const key = `${kind}:${ip}`;
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("rate_key", key)
    .gte("created_at", since);
  if ((count ?? 0) >= 12) {
    throw new Error("Limite de análises por hora atingido. Tente novamente em alguns minutos.");
  }
  await supabaseAdmin.from("rate_limits").insert({ rate_key: key });
}

async function callAi<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Configuração de IA indisponível no momento.");
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const lovable = createLovableResponsesProvider(key, runIdFetch);
  const result = streamText({
    model: lovable.responses("openai/gpt-6-astra"),
    output: Output.object({ schema }),
    prompt,
    providerOptions: REASONING_OPTIONS,
  });
  return await result.output;
}

/** Etapa 1: extrai keywords da vaga e compara com o currículo (código + IA semântica). */
export const analyzeMatch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => analyzeInput.parse(input))
  .handler(async ({ data }) => {
    await checkRateLimit("analyze");

    const extracted = await callAi(
      `Você extrai requisitos de vagas de emprego. Extraia da vaga abaixo a lista de requisitos e palavras-chave (máx. 25), cada uma com:
- term: o termo como aparece na vaga;
- category: hard_skill | ferramenta | soft_skill | certificacao | idioma | senioridade;
- importance: "essencial" (requisito obrigatório / "necessário" / "experiência com") ou "desejavel" (diferencial / "desejável" / "será um plus");
- synonyms: sinônimos e variações comuns, incluindo traduções pt-BR/en (ex.: "JS", "JavaScript"; "Gestão de projetos", "Project management").
Liste só o que a vaga realmente pede. Não invente requisitos.

VAGA:
${data.jobText}`,
      keywordSchema,
    );

    const normalizedResume = normalizeText(data.resumeText);
    const keywords: Keyword[] = extracted.keywords.map((kw) => {
      const variants = [kw.term, ...kw.synonyms];
      const hitVariant = variants.find((v) => containsTerm(normalizedResume, v));
      return {
        term: kw.term,
        category: kw.category,
        importance: kw.importance,
        synonyms: kw.synonyms,
        found: Boolean(hitVariant),
        evidence: hitVariant ? findEvidence(data.resumeText, hitVariant) : null,
      };
    });

    // IA resolve casos semânticos ambíguos apenas para keywords não encontradas
    const missing = keywords.filter((k) => !k.found);
    if (missing.length > 0) {
      const semanticSchema = z.object({
        matches: z.array(
          z.object({ term: z.string(), evidence: z.string().nullable() }),
        ),
      });
      const semantic = await callAi(
        `Você verifica se um currículo comprova requisitos de uma vaga, mesmo com palavras diferentes. Para CADA requisito listado, responda com evidence = trecho LITERAL copiado do currículo que comprova o requisito, ou null se não houver comprovação clara. Seja estrito: na dúvida, null. Não aceite inferências genéricas.

REQUISITOS: ${missing.map((m) => m.term).join(" | ")}

CURRÍCULO:
${data.resumeText}`,
        semanticSchema,
      );
      for (const m of semantic.matches) {
        const kw = keywords.find((k) => k.term === m.term);
        if (kw && m.evidence && data.resumeText.includes(m.evidence.trim().slice(0, 30))) {
          kw.found = true;
          kw.evidence = m.evidence;
        }
      }
    }

    return {
      keywords,
      scoreBefore: computeScore(keywords),
      checklist: atsChecklist(data.resumeText),
    };
  });

const generateInput = analyzeInput.extend({
  mode: z.enum(["geral", "tecnologia", "primeiro_emprego"]),
  keywords: z.array(
    z.object({
      term: z.string(),
      importance: z.enum(["essencial", "desejavel"]),
      found: z.boolean(),
    }),
  ),
  declaredItems: z.array(z.object({ keyword: z.string(), description: z.string() })),
});

const MODE_INSTRUCTIONS: Record<string, string> = {
  geral: `Estrutura padrão ATS: contato, Resumo Profissional, Experiência Profissional (ordem cronológica reversa, datas MM/AAAA), Formação Acadêmica, Habilidades, Certificações, Idiomas.`,
  tecnologia: `Modo TECNOLOGIA: inclua a experiência com bullets que tragam stack e contexto do problema (sem inventar métricas). Organize "skills" por relevância técnica. Destaque projetos, GitHub/portfólio e certificações se presentes no original.`,
  primeiro_emprego: `Modo PRIMEIRO EMPREGO: não exija experiência formal. Priorize Formação, Cursos, Projetos acadêmicos/pessoais, Voluntariado e Habilidades. Se não houver experiência profissional no original, o array "experience" fica VAZIO — não preencha com conteúdo fabricado. Resumo focado em objetivo e formação.`,
};

/** Etapas 2 e 3: gera o currículo otimizado e roda a auditoria de fidelidade. */
export const generateOptimizedResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => generateInput.parse(input))
  .handler(async ({ data }) => {
    await checkRateLimit("generate");

    const declaredBlock =
      data.declaredItems.length > 0
        ? `\nITENS DECLARADOS PELA PESSOA (podem ser incorporados, marcando declared=true e source_evidence="Declarado pela pessoa"): ${data.declaredItems
            .map((d) => `${d.keyword}: ${d.description}`)
            .join(" | ")}\n`
        : "";

    const missingTerms = data.keywords.filter((k) => !k.found).map((k) => k.term);

    const generated = await callAi(
      `Você otimiza currículos para sistemas ATS.
${NO_INVENT_RULE}
${MODE_INSTRUCTIONS[data.mode]}

PALAVRAS-CHAVE ENCONTRADAS no currículo (podem ser usadas com o vocabulário da vaga): ${data.keywords
        .filter((k) => k.found)
        .map((k) => k.term)
        .join(" | ")}

PALAVRAS-CHAVE FALTANTES (NUNCA inclua nenhuma delas no currículo): ${missingTerms.join(" | ") || "nenhuma"}
${declaredBlock}
Regras de formato ATS obrigatórias: uma coluna; sem tabelas/imagens/ícones; títulos de seção padrão; datas MM/AAAA; bullets simples começando com verbo de ação; contato em texto simples no topo. Mantenha o IDIOMA do currículo original em toda a saída.

Em "changes", liste cada alteração relevante (antes → depois) com o motivo, em pt-BR.

VAGA:
${data.jobText}

CURRÍCULO ORIGINAL:
${data.resumeText}`,
      resumeSchema,
    );

    // Auditoria de fidelidade (segunda chamada de IA, papel de auditor)
    const audit = await callAi(
      `Você é um auditor de fidelidade. Compare o CURRÍCULO GERADO com o CURRÍCULO ORIGINAL e sinalize QUALQUER afirmação sem sustentação: skill, ferramenta, cargo, empresa, data, métrica, formação, certificação, idioma ou escopo de responsabilidade que não exista no original (ex.: "participei" virou "liderei"). Itens declarados pela pessoa estão listados abaixo e são permitidos.
${declaredBlock}
Responda em "flags" apenas itens realmente inventados/inflados, citando o trecho gerado em "item" e o motivo em "reason" (pt-BR). Se estiver tudo fiel, retorne flags vazio.

CURRÍCULO ORIGINAL:
${data.resumeText}

CURRÍCULO GERADO:
${JSON.stringify({ summary: generated.summary, experience: generated.experience, skills: generated.skills, certifications: generated.certifications, languages: generated.languages }, null, 1)}`,
      fidelitySchema,
    );

    // Remove itens sinalizados antes de mostrar
    const flags: FidelityFlag[] = audit.flags;
    const flagged = new Set(flags.map((f) => normalizeText(f.item).slice(0, 40)));
    const isFlagged = (text: string) => {
      const n = normalizeText(text);
      for (const f of flagged) if (f && (n.includes(f) || f.includes(n.slice(0, 40)))) return true;
      return false;
    };
    const cleanResume: GeneratedResume = {
      ...generated,
      experience: generated.experience.map((e) => ({
        ...e,
        bullets: e.bullets.filter((b) => !isFlagged(b.text)),
      })),
      skills: generated.skills
        .filter((s) => !isFlagged(s.name))
        .map((s) => ({ name: s.name, source_evidence: s.source_evidence, ...(s.declared ? { declared: true } : {}) })),
      certifications: generated.certifications.filter((c) => !isFlagged(c.name)),
    };
    // Nunca deixar keyword faltante entrar sozinha: filtro final por literal
    const generatedText = normalizeText(resumeToPlainText(cleanResume));
    const declaredSet = new Set(data.declaredItems.map((d) => normalizeText(d.keyword)));
    for (const term of missingTerms) {
      if (declaredSet.has(normalizeText(term))) continue;
      const n = normalizeText(term);
      if (n && generatedText.includes(n)) {
        cleanResume.skills = cleanResume.skills.filter((s) => !normalizeText(s.name).includes(n));
        flags.push({
          item: term,
          reason: "Palavra-chave ausente no currículo original foi removida automaticamente.",
        });
      }
    }

    const scoreAfterKeywords = data.keywords.map((k) => {
      const declared = data.declaredItems.some((d) => normalizeText(d.keyword) === normalizeText(k.term));
      const nowFound = k.found || containsTerm(generatedText, k.term);
      return { ...k, found: nowFound, declared } as Keyword;
    });

    return {
      resume: cleanResume,
      changes: generated.changes as ChangeLog[],
      fidelityFlags: flags,
      keywords: scoreAfterKeywords,
      scoreAfter: computeScore(scoreAfterKeywords),
      checklist: atsChecklist(resumeToPlainText(cleanResume)),
    };
  });
