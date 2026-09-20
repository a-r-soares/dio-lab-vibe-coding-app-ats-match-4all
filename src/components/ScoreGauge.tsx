import { scoreBand } from "@/lib/scoring";

interface Props {
  score: number;
  size?: number;
  label?: string;
}

const COLORS = {
  baixo: "stroke-destructive text-destructive",
  medio: "stroke-warning text-warning-strong",
  alto: "stroke-success text-success-strong",
};

export function ScoreGauge({ score, size = 160, label }: Props) {
  const band = scoreBand(score);
  const r = 60;
  const c = 2 * Math.PI * r;
  const filled = (score / 100) * c;

  return (
    <div className="flex flex-col items-center gap-1" role="img" aria-label={`Compatibilidade: ${score} de 100`}>
      <svg width={size} height={size} viewBox="0 0 140 140" className="-rotate-0">
        <circle cx="70" cy="70" r={r} fill="none" strokeWidth="10" className="stroke-muted" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          transform="rotate(-90 70 70)"
          className={`${COLORS[band]} transition-[stroke-dasharray] duration-700`}
        />
        <text
          x="70"
          y="66"
          textAnchor="middle"
          className={`fill-current font-display text-3xl font-bold tabular ${COLORS[band]}`}
        >
          {score}
        </text>
        <text x="70" y="86" textAnchor="middle" className="fill-muted-foreground text-[10px]">
          de 100
        </text>
      </svg>
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
    </div>
  );
}
