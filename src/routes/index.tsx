import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ClipboardCopy,
  Download,
  FileText,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ChangesPanel } from "@/components/ChangesPanel";
import { KeywordPanel } from "@/components/KeywordPanel";
import { ResumePreview } from "@/components/ResumePreview";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { analyzeMatch, generateOptimizedResume } from "@/lib/analysis.functions";
import { exportResumeDocx } from "@/lib/export/docx";
import { exportResumePdf } from "@/lib/export/pdf";
import { downloadBlob, exportFileName, resumeToAtsText } from "@/lib/export/resume-text";
import { saveAnalysis } from "@/lib/history.functions";
import { SCORE_BAND_LABEL, scoreBand } from "@/lib/scoring";
import { supabase } from "@/integrations/supabase/client";
import {
  MODE_LABELS,
  type AtsChecklistItem,
  type ChangeLog,
  type DeclaredItem,
  type FidelityFlag,
  type GeneratedResume,
  type Keyword,
  type Mode,
} from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ATS Match 4All — seu currículo compatível com a vaga" },
      {
        name: "description",
        content:
          "Cole a vaga e seu currículo: veja o percentual de compatibilidade, as palavras-chave que faltam e receba uma versão otimizada para ATS — sem inventar experiência.",
      },
      { property: "og:title", content: "ATS Match 4All — seu currículo compatível com a vaga" },
      {
        property: "og:description",
        content:
          "Análise de compatibilidade entre currículo e vaga com score, palavras-chave e currículo otimizado fiel à sua experiência real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const MIN_CHARS = 80;
const MAX_CHARS = 15000;

const MODE_DESCRIPTIONS: Record<Mode, string> = {
  geral: "Estrutura ATS padrão, válida para a maioria das áreas.",
  tecnologia: "Destaque para stack técnica, projetos e certificações.",
  primeiro_emprego: "Sem experiência formal: prioriza formação, cursos e projetos.",
};

const EXAMPLE_JOB = `Analista de Marketing Digital Sênior

Requisitos:
- Experiência comprovada com Google Ads e Meta Ads
- Gestão de campanhas de performance e ROI
- Conhecimento em SEO, Google Analytics e CRM
- Inglês avançado
- Perfil analítico, boa comunicação e trabalho em equipe
- Desejável: certificação Google Ads e experiência com automação de marketing`;

const EXAMPLE_RESUME = `MARIA SILVA
São Paulo, SP | maria.silva@email.com | (11) 98765-4321

RESUMO
Profissional de marketing com 6 anos de experiência em mídia paga e análise de dados.

EXPERIÊNCIA
Analista de Marketing — Agência Exemplo (2021 - atual)
- Gerenciei campanhas no Google Ads com orçamento mensal de R$ 200 mil, aumentando o ROI em 35%
- Criei relatórios de performance no Google Analytics para 12 clientes
- Trabalhei em equipe multidisciplinar com designers e redatores

Assistente de Marketing — Loja XYZ (2019 - 2021)
- Apoiei campanhas de Meta Ads e e-mail marketing
- Organizei o CRM da base de 8 mil contatos

FORMAÇÃO
Bacharelado em Publicidade — Universidade de São Paulo (2015 - 2019)

HABILIDADES
Google Ads • Google Analytics • Meta Ads • CRM • Excel

IDIOMAS
Inglês — avançado`;

interface AnalyzeOutput {
  keywords: Keyword[];
  scoreBefore: number;
  checklist: AtsChecklistItem[];
}

interface OptimizeOutput {
  resume: GeneratedResume;
  changes: ChangeLog[];
  fidelityFlags: FidelityFlag[];
  keywords: Keyword[];
  scoreAfter: number;
  checklist: AtsChecklistItem[];
}

function HomePage() {
  const [mode, setMode] = useState<Mode>("geral");
  const [jobText, setJobText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [company, setCompany] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeOutput | null>(null);
  const [optimized, setOptimized] = useState<OptimizeOutput | null>(null);
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [declaring, setDeclaring] = useState(false);
  const [declaredItems, setDeclaredItems] = useState<DeclaredItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [versionGroupId, setVersionGroupId] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const analyzeFn = useServerFn(analyzeMatch);
  const optimizeFn = useServerFn(generateOptimizedResume);
  const saveFn = useServerFn(saveAnalysis);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(Boolean(data.user)));
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("ats-duplicar");
    if (!raw) return;
    sessionStorage.removeItem("ats-duplicar");
    try {
      const d = JSON.parse(raw) as {
        jobText?: string;
        resumeText?: string;
        mode?: Mode;
        jobTitle?: string;
        company?: string;
        versionGroupId?: string | null;
      };
      if (d.jobText) setJobText(d.jobText);
      if (d.resumeText) setResumeText(d.resumeText);
      if (d.mode) setMode(d.mode);
      if (d.jobTitle) setJobTitleInput(d.jobTitle);
      if (d.company) setCompany(d.company);
      if (d.versionGroupId) setVersionGroupId(d.versionGroupId);
    } catch {
      /* ignora dados inválidos */
    }
  }, []);

  const derivedTitle =
    jobText.split("\n").map((l) => l.trim()).find(Boolean)?.slice(0, 200) ?? null;
  const jobTitle = jobTitleInput.trim() ? jobTitleInput.trim().slice(0, 200) : derivedTitle;

  const canAnalyze =
    jobText.trim().length >= MIN_CHARS &&
    resumeText.trim().length >= MIN_CHARS &&
    !analyzing;

  const keywords = optimized?.keywords ?? analysis?.keywords ?? [];
  const checklist = optimized?.checklist ?? analysis?.checklist ?? [];
  const scoreBefore = analysis?.scoreBefore ?? 0;

  async function handleAnalyze() {
    if (!canAnalyze) return;
    setAnalyzing(true);
    setAnalysis(null);
    setOptimized(null);
    setResume(null);
    setDeclaredItems([]);
    setVersionGroupId(null);
    try {
      const res = (await analyzeFn({ data: { jobText, resumeText } })) as AnalyzeOutput;
      setAnalysis(res);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleOptimize(items: DeclaredItem[] = declaredItems) {
    if (!analysis || optimizing) return;
    setOptimizing(true);
    try {
      const res = (await optimizeFn({
        data: {
          mode,
          jobText,
          resumeText,
          keywords: analysis.keywords.map((k) => ({
            term: k.term,
            importance: k.importance,
            found: k.found || Boolean(k.declared),
          })),
          declaredItems: items,
        },
      })) as OptimizeOutput;
      setOptimized(res);
      setResume(res.resume);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setOptimizing(false);
    }
  }

  async function handleDeclare(keyword: Keyword, description: string) {
    setDeclaring(true);
    const items = [...declaredItems, { keyword: keyword.term, description }];
    setDeclaredItems(items);
    await handleOptimize(items);
    setDeclaring(false);
    toast.success(`"${keyword.term}" incluído a partir do que você descreveu.`);
  }

  async function handleSave() {
    if (!analysis || !optimized || !resume) return;
    if (!loggedIn) {
      toast.info("Crie uma conta gratuita para salvar suas análises.");
      navigate({ to: "/auth" });
      return;
    }
    setSaving(true);
    try {
      const saved = await saveFn({
        data: {
          jobTitle,
          company: company.trim() ? company.trim().slice(0, 200) : null,
          jobText,
          resumeOriginalText: resumeText,
          mode,
          scoreBefore: analysis.scoreBefore,
          scoreAfter: optimized.scoreAfter,
          keywordsFound: optimized.keywords.filter((k) => k.found || k.declared),
          keywordsMissing: optimized.keywords.filter((k) => !k.found && !k.declared),
          userDeclaredItems: declaredItems,
          resumeGenerated: resume,
          fidelityFlags: optimized.fidelityFlags,
          changes: optimized.changes,
          versionGroupId,
        },
      });
      setVersionGroupId(saved.version_group_id);
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      toast.success(`Análise salva (versão ${saved.version_number}).`);
    } catch {
      toast.error("Não foi possível salvar agora. Tente de novo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleExport(kind: "pdf" | "docx" | "txt" | "copy") {
    if (!resume) return;
    try {
      if (kind === "pdf") await exportResumePdf(resume, jobTitle);
      else if (kind === "docx") await exportResumeDocx(resume, jobTitle);
      else if (kind === "txt") {
        await downloadBlob(
          new Blob([resumeToAtsText(resume)], { type: "text/plain" }),
          exportFileName(resume, jobTitle, "txt"),
        );
      } else {
        await navigator.clipboard.writeText(resumeToAtsText(resume));
        toast.success("Currículo copiado.");
      }
    } catch {
      toast.error("Não foi possível exportar agora. Tente de novo.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:py-12">
      {/* Hero + formulário */}
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
          Seu currículo compatível com a vaga —{" "}
          <span className="text-primary">sem inventar experiência</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Cole a vaga e seu currículo. Mostramos o percentual de compatibilidade, o que falta e
          geramos uma versão otimizada para ATS, sempre fiel ao que você realmente viveu.
        </p>
      </section>

      <section className="mx-auto mt-8 max-w-4xl rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <fieldset>
          <legend className="sr-only">Modo de saída do currículo</legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Modo de saída">
            {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
              <button
                key={m}
                role="radio"
                aria-checked={mode === m}
                onClick={() => setMode(m)}
                className={`min-h-11 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors focus-ring sm:text-sm ${
                  mode === m
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50"
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{MODE_DESCRIPTIONS[mode]}</p>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="job-title">Título da vaga (opcional)</Label>
            <Input
              id="job-title"
              value={jobTitleInput}
              onChange={(e) => setJobTitleInput(e.target.value.slice(0, 200))}
              placeholder="Ex.: Analista de Marketing Digital"
              className="h-12"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Empresa (opcional)</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value.slice(0, 200))}
              placeholder="Ex.: Agência Exemplo"
              className="h-12"
            />
          </div>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Ajudam a encontrar a análise depois no seu histórico.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="job-text">Descrição da vaga</Label>
              <button
                type="button"
                onClick={() => setJobText(EXAMPLE_JOB)}
                className="rounded text-xs font-medium text-primary underline-offset-4 hover:underline focus-ring"
              >
                Usar exemplo
              </button>
            </div>
            <Textarea
              id="job-text"
              value={jobText}
              onChange={(e) => setJobText(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Cole aqui a descrição completa da vaga (requisitos, responsabilidades)…"
              rows={10}
              className="min-h-56"
            />
            <CharCount value={jobText} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="resume-text">Seu currículo atual</Label>
              <button
                type="button"
                onClick={() => setResumeText(EXAMPLE_RESUME)}
                className="rounded text-xs font-medium text-primary underline-offset-4 hover:underline focus-ring"
              >
                Usar exemplo
              </button>
            </div>
            <Textarea
              id="resume-text"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Cole aqui o texto do seu currículo atual…"
              rows={10}
              className="min-h-56"
            />
            <CharCount value={resumeText} />
          </div>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="mt-6 h-14 w-full bg-primary text-base font-semibold hover:bg-primary-hover"
        >
          {analyzing ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden /> Analisando compatibilidade…
            </>
          ) : (
            "Analisar compatibilidade"
          )}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Sem conta, nada é salvo: a análise existe só na sua tela.
        </p>
      </section>

      {/* Resultado */}
      {analysis && (
        <div ref={resultRef} className="mt-10 scroll-mt-20 space-y-8">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
              <ScoreGauge
                score={scoreBefore}
                label={optimized ? "Antes da otimização" : "Compatibilidade atual"}
              />
              {optimized && (
                <>
                  <div className="hidden text-3xl text-muted-foreground sm:block" aria-hidden>
                    →
                  </div>
                  <ScoreGauge score={optimized.scoreAfter} label="Depois da otimização" />
                </>
              )}
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {jobTitle && (
                <>
                  Vaga: <strong className="text-foreground">{jobTitle}</strong> ·{" "}
                </>
              )}
              {SCORE_BAND_LABEL[scoreBand(optimized?.scoreAfter ?? scoreBefore)]}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <KeywordPanel
              keywords={keywords}
              onDeclare={handleDeclare}
              declaring={declaring || optimizing}
            />
          </section>

          {/* Checklist ATS */}
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 font-display text-lg font-semibold">Checklist ATS</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-start gap-2 text-sm">
                  {item.ok ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  ) : (
                    <X className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                  )}
                  <span className={item.ok ? "" : "text-muted-foreground"}>{item.label}</span>
                </li>
              ))}
            </ul>
          </section>

          {!resume && (
            <section className="rounded-2xl border border-primary/30 bg-primary-soft p-4 text-center shadow-sm sm:p-8">
              <h2 className="text-xl font-bold sm:text-2xl">Pronto para a versão otimizada?</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Reescrevemos o que você já viveu com as palavras da vaga. Cada afirmação é checada
                contra o seu currículo original — nada é inventado.
              </p>
              <Button
                onClick={() => handleOptimize()}
                disabled={optimizing}
                className="mt-4 h-14 bg-primary px-8 text-base font-semibold hover:bg-primary-hover"
              >
                {optimizing ? (
                  <>
                    <Loader2 className="size-5 animate-spin" aria-hidden /> Gerando currículo
                    otimizado…
                  </>
                ) : (
                  "Gerar currículo otimizado"
                )}
              </Button>
            </section>
          )}

          {resume && (
            <>
              {/* Mobile: abas / Desktop: grade */}
              <div className="lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-6">
                <div className="sm:hidden">
                  <Tabs defaultValue="preview">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="preview" className="min-h-11">Currículo</TabsTrigger>
                      <TabsTrigger value="changes" className="min-h-11">Mudanças</TabsTrigger>
                      <TabsTrigger value="text" className="min-h-11">Texto</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview" className="mt-4">
                      <ResumePreview resume={resume} onChange={setResume} />
                    </TabsContent>
                    <TabsContent value="changes" className="mt-4">
                      <ChangesPanel changes={optimized?.changes ?? []} flags={optimized?.fidelityFlags ?? []} />
                    </TabsContent>
                    <TabsContent value="text" className="mt-4">
                      <PlainTextView text={resumeToAtsText(resume)} />
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="hidden sm:block lg:sticky lg:top-24 lg:self-start">
                  <ResumePreview resume={resume} onChange={setResume} />
                </div>
                <div className="mt-8 hidden space-y-8 sm:block lg:mt-0">
                  <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
                    <ChangesPanel changes={optimized?.changes ?? []} flags={optimized?.fidelityFlags ?? []} />
                  </section>
                  <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
                    <h2 className="mb-3 font-display text-lg font-semibold">Versão em texto</h2>
                    <PlainTextView text={resumeToAtsText(resume)} />
                  </section>
                </div>
              </div>

              {/* Barra de ações fixa */}
              <div className="sticky bottom-0 -mx-4 mt-8 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
                <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-2">
                  <Button variant="outline" className="h-12" onClick={() => handleExport("pdf")}>
                    <Download className="size-4" aria-hidden /> PDF
                  </Button>
                  <Button variant="outline" className="h-12" onClick={() => handleExport("docx")}>
                    <FileText className="size-4" aria-hidden /> DOCX
                  </Button>
                  <Button variant="outline" className="h-12" onClick={() => handleExport("txt")}>
                    TXT
                  </Button>
                  <Button variant="outline" className="h-12" onClick={() => handleExport("copy")}>
                    <ClipboardCopy className="size-4" aria-hidden /> Copiar
                  </Button>
                  <Button
                    className="h-12 bg-primary hover:bg-primary-hover"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save className="size-4" aria-hidden />
                    {saving ? "Salvando…" : loggedIn ? "Salvar análise" : "Salvar (criar conta)"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-12"
                    onClick={() => {
                      setAnalysis(null);
                      setOptimized(null);
                      setResume(null);
                      setDeclaredItems([]);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <ArrowLeft className="size-4" aria-hidden /> Nova análise
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CharCount({ value }: { value: string }) {
  const len = value.trim().length;
  const ok = len >= MIN_CHARS;
  return (
    <p className={`text-xs ${ok ? "text-muted-foreground" : "text-warning-strong"}`}>
      {len.toLocaleString("pt-BR")} caracteres {ok ? "" : `— mínimo de ${MIN_CHARS}`}
    </p>
  );
}

function PlainTextView({ text }: { text: string }) {
  return (
    <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm text-foreground">
      {text}
    </pre>
  );
}

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("Limite de análises")) return msg;
  if (msg.includes("curto") || msg.includes("longo")) return msg;
  if (msg.includes("Configuração de IA"))
    return "O serviço de IA não está disponível no momento. Tente novamente mais tarde.";
  return "Não foi possível concluir agora. Tente de novo em instantes.";
}
