import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAnalysis, listAnalyses } from "@/lib/history.functions";
import { MODE_LABELS, type Mode } from "@/lib/types";

const analysesQuery = queryOptions({
  queryKey: ["analyses"],
  queryFn: () => listAnalyses(),
});

export const Route = createFileRoute("/_authenticated/historico/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(analysesQuery),
  head: () => ({
    meta: [
      { title: "Meu histórico — ATS Match 4All" },
      {
        name: "description",
        content: "Suas análises salvas de compatibilidade entre currículo e vaga.",
      },
    ],
  }),
  errorComponent: () => (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Não foi possível carregar seu histórico</h1>
      <p className="mt-2 text-muted-foreground">Atualize a página e tente de novo.</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
    </div>
  ),
  component: HistoricoPage,
});

const MODE_FILTERS: Array<{ value: "todos" | Mode; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "geral", label: MODE_LABELS.geral },
  { value: "tecnologia", label: MODE_LABELS.tecnologia },
  { value: "primeiro_emprego", label: MODE_LABELS.primeiro_emprego },
];

function HistoricoPage() {
  const { data } = useSuspenseQuery(analysesQuery);
  const queryClient = useQueryClient();
  const deleteFn = useServerFn(deleteAnalysis);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<"todos" | Mode>("todos");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((a) => {
      const matchesMode = modeFilter === "todos" || a.mode === modeFilter;
      const matchesText =
        q.length === 0 ||
        (a.job_title ?? "").toLowerCase().includes(q) ||
        (a.company ?? "").toLowerCase().includes(q);
      return matchesMode && matchesText;
    });
  }, [data, search, modeFilter]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const a of filtered) {
      const list = map.get(a.version_group_id) ?? [];
      list.push(a);
      map.set(a.version_group_id, list);
    }
    return [...map.values()].map((versions) =>
      [...versions].sort((x, y) => y.version_number - x.version_number),
    );
  }, [filtered]);

  async function handleDelete(id: string) {
    try {
      await deleteFn({ data: { id } });
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      toast.success("Análise excluída.");
    } catch {
      toast.error("Não foi possível excluir agora.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Meu histórico</h1>
      <p className="mt-2 text-muted-foreground">
        Abra qualquer análise para ver o resultado completo, exportar de novo ou criar uma nova
        versão.
      </p>

      {data.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">Você ainda não salvou nenhuma análise.</p>
          <Button asChild className="mt-4 h-12 bg-primary hover:bg-primary-hover">
            <Link to="/">Fazer minha primeira análise</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Label htmlFor="busca" className="sr-only">
                Buscar por vaga ou empresa
              </Label>
              <Input
                id="busca"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por vaga ou empresa…"
                className="h-12 pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filtrar por modo">
              {MODE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  role="radio"
                  aria-checked={modeFilter === f.value}
                  onClick={() => setModeFilter(f.value)}
                  className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors focus-ring ${
                    modeFilter === f.value
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {groups.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              Nenhuma análise corresponde à sua busca.
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {groups.map((versions) => {
                const head = versions[0]!;
                return (
                  <li
                    key={head.version_group_id}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <p className="font-semibold">
                      {head.job_title ?? "Vaga sem título"}
                      {head.company ? ` · ${head.company}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {MODE_LABELS[head.mode as Mode]} ·{" "}
                      {versions.length === 1 ? "1 versão" : `${versions.length} versões`}
                    </p>

                    <ul className="mt-3 space-y-2">
                      {versions.map((a) => (
                        <li
                          key={a.id}
                          className="flex flex-col gap-2 rounded-xl border border-border/70 bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0 text-sm">
                            <p className="font-medium">Versão {a.version_number}</p>
                            <p className="mt-0.5 text-muted-foreground tabular">
                              score {a.score_before}
                              {a.score_after != null ? ` → ${a.score_after}` : ""} ·{" "}
                              {new Date(a.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <Button asChild className="h-11 bg-primary hover:bg-primary-hover">
                              <Link to="/historico/$id" params={{ id: a.id }}>
                                Abrir <ChevronRight className="size-4" aria-hidden />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="h-11"
                                  aria-label={`Excluir versão ${a.version_number} de ${a.job_title ?? "vaga sem título"}`}
                                >
                                  <Trash2 className="size-4" aria-hidden />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir esta análise?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    A versão {a.version_number} de “
                                    {a.job_title ?? "vaga sem título"}” será apagada
                                    definitivamente, junto com o currículo otimizado salvo.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="h-11">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleDelete(a.id)}
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
