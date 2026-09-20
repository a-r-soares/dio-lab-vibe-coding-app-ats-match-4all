import { Check, X } from "lucide-react";

import { checkPassword, passwordStrengthScore } from "@/lib/password";

interface Props {
  password: string;
  email?: string | undefined;
  name?: string | undefined;
}

export function PasswordStrength({ password, email, name }: Props) {
  if (!password) return null;
  const checks = checkPassword(password, { email, name });
  const score = passwordStrengthScore(password, { email, name });
  const pct = Math.round(score * 100);
  const color = pct >= 100 ? "bg-success" : pct >= 60 ? "bg-warning" : "bg-destructive";
  const label = pct >= 100 ? "Senha forte" : pct >= 60 ? "Senha média" : "Senha fraca";

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center gap-2">
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Força da senha: ${label}`}
        >
          <div className={`h-full transition-all ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <ul className="grid gap-1 text-xs sm:grid-cols-2">
        {checks.map((c) => (
          <li key={c.id} className="flex items-center gap-1.5">
            {c.ok ? (
              <Check className="size-3.5 shrink-0 text-success" aria-hidden />
            ) : (
              <X className="size-3.5 shrink-0 text-destructive" aria-hidden />
            )}
            <span className={c.ok ? "text-muted-foreground" : "text-foreground"}>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
