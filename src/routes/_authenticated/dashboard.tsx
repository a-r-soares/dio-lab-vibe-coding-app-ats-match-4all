import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { listAnalyses } from "@/lib/history.functions";
import { scoreBand } from "@/lib/scoring";
import { MODE_LABELS, type Mode } from "@/lib/types";

const analysesQuery = queryOptions({
  queryKey: ["analyses"],
  queryFn: () => listAnalyses(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(analysesQuery),
  head: () => ({
    meta: [
      { title: "Dashboard de evolução — ATS Match 4All" },
      { name: "description", content: "Acompanhe a evolução dos seus scores de compatibilidade." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data } = useSuspenseQuery(analysesQuery);
  const withScore = data.filter((a) => a.score_after != null);
  const avgBefore =
    withScore.length > 0
      ? Math.round(withScore.reduce((s, a) => s + (a.score_before ?? 0), 0) / withScore.length)
      : 0;
  const avgAfter =
    withScore.length > 0
      ? Math.round(withScore.reduce((s, a) => s + (a.score_after ?? 0), 0) / withScore.length)
      : 0;
  const best = withScore.reduce<(typeof withScore)[number] | null>(
    (acc, a) => (acc == null || (a.score_after ?? 0) > (acc.score_after ?? 0) ? a : acc),
    null,
  );

  const recent = [...withScore]
    .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    .slice(-10);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Dashboard de evolução</h1>
      <p className="mt-2 text-muted-foreground">
        Como seus scores evoluem a cada otimização.
      </p>

      {withScore.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">
            Salve análises otimizadas para ver sua evolução aqui.
          </p>
          <Button asChild className="mt-4 h-12 bg-primary hover:bg-primary-hover">
            <Link to="/">Analisar uma vaga</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Score médio antes" value={avgBefore} />
            <StatCard label="Score médio depois" value={avgAfter} highlight />
            <StatCard
              label="Melhor resultado"
              value={best?.score_after ?? 0}
              sub={best ? `${best.job_title} (${scoreBand(best.score_after ?? 0)})` : undefined}
            />
          </div>

          <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">
              Evolução recente (depois da otimização)
            </h2>
            <ul className="space-y-3">
              {recent.map((a) => (
                <li key={a.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium">{a.job_title}</span>
                    <span className="shrink-0 tabular text-muted-foreground">
                      {a.score_before} → <strong className="text-foreground">{a.score_after}</strong>
                    </span>
                  </div>
                  <div
                    className="mt-1 h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={a.score_after ?? 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Score ${a.score_after} para ${a.job_title}`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${
                        scoreBand(a.score_after ?? 0) === "alto"
                          ? "bg-success"
                          : scoreBand(a.score_after ?? 0) === "medio"
                            ? "bg-warning"
                            : "bg-destructive"
                      }`}
                      style={{ width: `${a.score_after ?? 0}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {MODE_LABELS[a.mode as Mode]} · {new Date(a.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number;
  sub?: string | undefined;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-primary/40 bg-primary-soft" : "border-border bg-card"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-4xl font-bold tabular">{value}</p>
      {sub && <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
