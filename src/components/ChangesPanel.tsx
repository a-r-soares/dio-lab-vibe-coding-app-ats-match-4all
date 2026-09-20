import { ArrowRight, ShieldCheck } from "lucide-react";

import type { ChangeLog, FidelityFlag } from "@/lib/types";

interface Props {
  changes: ChangeLog[];
  flags: FidelityFlag[];
}

export function ChangesPanel({ changes, flags }: Props) {
  return (
    <div className="space-y-6">
      <section aria-labelledby="changes-title">
        <h3 id="changes-title" className="mb-3 font-display text-base font-semibold">
          O que mudou e por quê
        </h3>
        {changes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma alteração relevante foi necessária — seu currículo já estava bem estruturado.
          </p>
        ) : (
          <ul className="space-y-3">
            {changes.map((c, i) => (
              <li key={i} className="rounded-xl border border-border bg-card p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {c.section}
                </p>
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-start sm:gap-2">
                  <span className="flex-1 text-muted-foreground line-through decoration-destructive/60">
                    {c.before}
                  </span>
                  <ArrowRight className="hidden size-4 shrink-0 text-primary sm:mt-0.5 sm:block" aria-hidden />
                  <span className="flex-1 font-medium">{c.after}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Por quê:</span> {c.reason}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="fidelity-title">
        <h3 id="fidelity-title" className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
          <ShieldCheck className="size-5 text-success" aria-hidden /> Verificação de fidelidade
        </h3>
        {flags.length === 0 ? (
          <p className="rounded-xl border border-success/30 bg-success-soft p-4 text-sm text-success-strong">
            Tudo certo: cada afirmação do currículo otimizado tem sustentação no seu currículo original.
          </p>
        ) : (
          <ul className="space-y-2">
            {flags.map((f, i) => (
              <li key={i} className="rounded-xl border border-warning/40 bg-warning-soft p-4 text-sm">
                <p className="font-medium text-warning-strong">Removido: “{f.item}”</p>
                <p className="mt-1 text-muted-foreground">{f.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
