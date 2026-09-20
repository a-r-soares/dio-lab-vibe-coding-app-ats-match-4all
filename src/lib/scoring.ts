import type { AtsChecklistItem, GeneratedResume, Keyword } from "./types";

/** Normaliza texto para comparação: minúsculas, sem acentos, sem pontuação. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s+#./-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Procura um termo (ou variação) como "palavra" no texto normalizado. */
export function containsTerm(normalizedHaystack: string, term: string): boolean {
  const needle = normalizeText(term);
  if (!needle) return false;
  // Termos curtos com símbolos (c++, c#, .net) usam fronteira flexível
  const pattern = escapeRegex(needle).replace(/\s+/g, "\\s+");
  const re = new RegExp(`(^|\\s)${pattern}(?=\\s|$|[,.;:)])`, "i");
  return re.test(normalizedHaystack);
}

/** Extrai um trecho literal do texto original que contenha o termo. */
export function findEvidence(originalText: string, term: string): string | null {
  const needle = normalizeText(term);
  if (!needle) return null;
  const normalized = normalizeText(originalText);
  const pattern = escapeRegex(needle).replace(/\s+/g, "\\s+");
  const re = new RegExp(`(^|\\s)${pattern}(?=\\s|$|[,.;:)])`, "i");
  const match = re.exec(normalized);
  if (!match) return null;
  // Aproxima o trecho no texto original pelo índice (normalização preserva tamanho aproximado)
  const start = Math.max(0, match.index - 80);
  const end = Math.min(originalText.length, match.index + needle.length + 80);
  let snippet = originalText.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) snippet = "…" + snippet;
  if (end < originalText.length) snippet = snippet + "…";
  return snippet;
}

/** Score determinístico: essencial pesa 3, desejável pesa 1. */
export function computeScore(keywords: Keyword[]): number {
  let earned = 0;
  let total = 0;
  for (const kw of keywords) {
    const weight = kw.importance === "essencial" ? 3 : 1;
    total += weight;
    if (kw.found || kw.declared) earned += weight;
  }
  if (total === 0) return 0;
  return Math.round((earned / total) * 100);
}

/** Serializa o currículo gerado em texto puro para recalcular o score. */
export function resumeToPlainText(resume: GeneratedResume): string {
  const parts: string[] = [
    resume.name,
    resume.city,
    resume.email,
    resume.phone,
    resume.linkedin,
    resume.summary,
  ];
  for (const exp of resume.experience) {
    parts.push(exp.company, exp.role, exp.period);
    for (const b of exp.bullets) parts.push(b.text);
  }
  for (const edu of resume.education) parts.push(edu.institution, edu.degree, edu.period);
  for (const s of resume.skills) parts.push(s.name);
  for (const c of resume.certifications) parts.push(c.name);
  for (const l of resume.languages) parts.push(l.name, l.level);
  return parts.filter(Boolean).join("\n");
}

/** Checklist de formato ATS (separado do score de conteúdo). */
export function atsChecklist(resumeText: string): AtsChecklistItem[] {
  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(resumeText);
  const hasPhone = /(\+?\d{2,3}\s*)?(\(?\d{2}\)?\s*)?\d{4,5}[-\s]?\d{4}/.test(resumeText);
  const sectionHints = ["experiência", "experience", "formação", "education", "habilidades", "skills"];
  const normalized = normalizeText(resumeText);
  const hasSections = sectionHints.filter((s) => normalized.includes(normalizeText(s))).length >= 2;
  const hasDates = /\d{2}\/\d{4}|\d{4}\s*[-–a]\s*\d{4}|20\d{2}|19\d{2}/.test(resumeText);
  const wordCount = normalized.split(" ").length;
  return [
    { label: "E-mail de contato presente", ok: hasEmail },
    { label: "Telefone de contato presente", ok: hasPhone },
    { label: "Seções reconhecíveis (Experiência, Formação, Habilidades)", ok: hasSections },
    { label: "Datas de experiência/formação identificáveis", ok: hasDates },
    { label: "Extensão adequada (200 a 1.200 palavras)", ok: wordCount >= 200 && wordCount <= 1200 },
    { label: "Sem tabelas, imagens ou elementos gráficos", ok: true },
  ];
}

export function scoreBand(score: number): "baixo" | "medio" | "alto" {
  if (score >= 75) return "alto";
  if (score >= 50) return "medio";
  return "baixo";
}

export const SCORE_BAND_LABEL = {
  baixo: "Compatibilidade baixa — há lacunas importantes em relação à vaga.",
  medio: "Compatibilidade média — boa base, com pontos a fortalecer.",
  alto: "Compatibilidade alta — seu currículo está bem alinhado à vaga.",
} as const;
