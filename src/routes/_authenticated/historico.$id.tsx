import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, ClipboardCopy, Copy, Download, FileText, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ChangesPanel } from "@/components/ChangesPanel";
import { ResumePreview } from "@/components/ResumePreview";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportResumeDocx } from "@/lib/export/docx";
import { exportResumePdf } from "@/lib/export/pdf";
import { downloadBlob, exportFileName, resumeToAtsText } from "@/lib/export/resume-text";
import { getAnalysis } from "@/lib/history.functions";
import { atsChecklist, resumeToPlainText, SCORE_BAND_LABEL, scoreBand } from "@/lib/scoring";
import {
  CATEGORY_LABELS,
  MODE_LABELS,
  type ChangeLog,
  type DeclaredItem,
  type FidelityFlag,
  type GeneratedResume,
  type Keyword,
  type Mode,
} from "@/lib/types";

const analysisQuery = (id: string) =>
  queryOptions({
    queryKey: ["analysis", id],
    queryFn: () => getAnalysis({ data: { id } }),
  });

export const Route = createFileRoute("/_authenticated/historico/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(analysisQuery(params.id)),
  head: () => ({
    meta: [
      { title: "Análise salva — ATS Match 4All" },
      {
        name: "description",
        content: "Recupere o resultado completo de uma análise salva e exporte de novo o currículo.",
      },
    ],
  }),
  errorComponent: () => (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Não foi possível abrir esta análise</h1>
      <p className="mt-2 text-muted-foreground">
        Ela pode ter sido excluída. Volte ao histórico e tente outra.
      </p>
      <Button asChild className="mt-6 h-12 bg-primary hover:bg-primary-hover">
        <Link to="/historico">Voltar ao histórico</Link>
      </Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Análise não encontrada</h1>
      <Button asChild className="mt-6 h-12 bg-primary hover:bg-primary-hover">
        <Link to="/historico">Voltar ao histórico</Link>
      </Button>
    </div>
  ),
  component: AnalysisDetailPage,
});

function AnalysisDetailPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(analysisQuery(id));
  const navigate = useNavigate();

  const saved = (data.resume_generated ?? null) as GeneratedResume | null;
  const [resume, setResume] = useState<GeneratedResume | null>(saved);

  const found = (data.keywords_found ?? []) as unknown as Keyword[];
  const missing = (data.keywords_missing ?? []) as unknown as Keyword[];
  const changes = (data.changes ?? []) as unknown as ChangeLog[];
  const flags = (data.fidelity_flags ?? []) as unknown as FidelityFlag[];
  const declared = (data.user_declared_items ?? []) as unknown as DeclaredItem[];
  const jobTitle = data.job_title;
  const checklist = resume ? atsChecklist(resumeToPlainText(resume)) : [];

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

  function handleDuplicate() {
    sessionStorage.setItem(
      "ats-duplicar",
      JSON.stringify({
        jobText: data.job_text,
        resumeText: data.resume_original_text,
        mode: data.mode,
        jobTitle: data.job_title ?? "",
        company: data.company ?? "",
        versionGroupId: data.version_group_id,
      }),
    );
    toast.info("Vaga e currículo carregados para uma nova versão.");
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      <Button asChild variant="ghost" className="h-11 px-2">
        <Link to="/historico">
          <ArrowLeft className="size-4" aria-hidden /> Voltar ao histórico
        </Link>
      </Button>

      <header className="mt-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{jobTitle ?? "Análise salva"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.company ? `${data.company} · ` : ""}
          {MODE_LABELS[data.mode as Mode]} · versão {data.version_number} ·{" "}
          {new Date(data.created_at).toLocaleDateString("pt-BR")}
        </p>
      </header>

      <section className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
          <ScoreGauge score={data.score_before ?? 0} label="Antes da otimização" />
          {data.score_after != null && (
            <>
              <div className="hidden text-3xl text-muted-foreground sm:block" aria-hidden>
                →
              </div>
              <ScoreGauge score={data.score_after} label="Depois da otimização" />
            </>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {SCORE_BAND_LABEL[scoreBand(data.score_after ?? data.score_before ?? 0)]}
        </p>
      </section>

      <section className="mt-6 grid gap-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
            <Check className="size-5 text-success" aria-hidden /> Encontradas ({found.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {found.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma registrada.</p>
            )}
            {found.map((kw) => (
              <span
                key={kw.term}
                className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-soft px-3 py-1.5 text-sm font-medium text-success-strong"
                title={kw.declaredText ?? kw.evidence ?? undefined}
              >
                {kw.term}
                <span className="text-xs font-normal opacity-80">
                  {CATEGORY_LABELS[kw.category]}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 font-display text-base font-semibold">
            O que ainda falta ({missing.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {missing.length === 0 && (
              <p className="text-sm text-muted-foreground">Nada faltando nesta versão.</p>
            )}
            {missing.map((kw) => (
              <span
                key={kw.term}
                className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning-soft px-3 py-1.5 text-sm font-medium text-warning-strong"
              >
                {kw.term}
                <span className="text-xs font-normal opacity-80">
                  {kw.importance === "essencial" ? "Essencial" : "Desejável"}
                </span>
              </span>
            ))}
          </div>
          {declared.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 font-display text-base font-semibold">
                Experiências que você declarou
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {declared.map((d) => (
                  <li key={d.keyword}>
                    <strong className="text-foreground">{d.keyword}:</strong> {d.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {resume ? (
        <>
          {checklist.length > 0 && (
            <section className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
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
          )}

          <div className="mt-6 lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-6">
            <div className="sm:hidden">
              <Tabs defaultValue="preview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preview" className="min-h-11">
                    Currículo
                  </TabsTrigger>
                  <TabsTrigger value="changes" className="min-h-11">
                    Mudanças
                  </TabsTrigger>
                  <TabsTrigger value="text" className="min-h-11">
                    Texto
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <ResumePreview resume={resume} onChange={setResume} />
                </TabsContent>
                <TabsContent value="changes" className="mt-4">
                  <ChangesPanel changes={changes} flags={flags} />
                </TabsContent>
                <TabsContent value="text" className="mt-4">
                  <PlainText text={resumeToAtsText(resume)} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="hidden sm:block lg:sticky lg:top-24 lg:self-start">
              <ResumePreview resume={resume} onChange={setResume} />
            </div>
            <div className="mt-8 hidden space-y-8 sm:block lg:mt-0">
              <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <ChangesPanel changes={changes} flags={flags} />
              </section>
              <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <h2 className="mb-3 font-display text-lg font-semibold">Versão em texto</h2>
                <PlainText text={resumeToAtsText(resume)} />
              </section>
            </div>
          </div>

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
              <Button className="h-12 bg-primary hover:bg-primary-hover" onClick={handleDuplicate}>
                <Copy className="size-4" aria-hidden /> Duplicar (nova versão)
              </Button>
            </div>
          </div>
        </>
      ) : (
        <section className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">
            Esta análise foi salva sem o currículo otimizado.
          </p>
          <Button className="mt-4 h-12 bg-primary hover:bg-primary-hover" onClick={handleDuplicate}>
            Gerar agora a partir desta vaga
          </Button>
        </section>
      )}
    </div>
  );
}

function PlainText({ text }: { text: string }) {
  return (
    <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm text-foreground">
      {text}
    </pre>
  );
}
