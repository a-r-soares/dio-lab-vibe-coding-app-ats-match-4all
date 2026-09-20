import { AlertTriangle, Check, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_LABELS, type Keyword } from "@/lib/types";

interface Props {
  keywords: Keyword[];
  onDeclare: (keyword: Keyword, description: string) => void;
  declaring: boolean;
}

function Badge({ kw, onDeclare, declaring }: { kw: Keyword; onDeclare: Props["onDeclare"]; declaring: boolean }) {
  const [askOpen, setAskOpen] = useState(false);
  const [text, setText] = useState("");

  const base =
    "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors";

  if (kw.found || kw.declared) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={`${base} border-success/30 bg-success-soft text-success-strong hover:border-success/60 focus-ring`}
            aria-label={`${kw.term} — encontrada. Ver evidência.`}
          >
            <Check className="size-4" aria-hidden />
            {kw.term}
            <span className="text-xs font-normal opacity-80">{CATEGORY_LABELS[kw.category]}</span>
            {kw.declared && <Sparkles className="size-3.5" aria-label="Declarada por você" />}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 text-sm">
          <p className="mb-1 font-semibold">Evidência no currículo</p>
          <p className="text-muted-foreground italic">
            {kw.declared && kw.declaredText
              ? `Declarado por você: “${kw.declaredText}”`
              : kw.evidence ?? "Encontrada no texto do currículo."}
          </p>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={askOpen} onOpenChange={setAskOpen}>
      <PopoverTrigger asChild>
        <button
          className={`${base} border-warning/40 bg-warning-soft text-warning-strong hover:border-warning/70 focus-ring`}
          aria-label={`${kw.term} — faltante. Toque para ver opções.`}
        >
          <AlertTriangle className="size-4" aria-hidden />
          {kw.term}
          <span className="text-xs font-normal opacity-80">
            {kw.importance === "essencial" ? "Essencial" : "Desejável"} · {CATEGORY_LABELS[kw.category]}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm">
        <p className="mb-2 font-semibold">A vaga pede “{kw.term}” e não encontramos isso no seu currículo.</p>
        {askOpen && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-11" onClick={() => setAskOpen(false)}>
                Não tenho isso
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Se você tem essa experiência, descreva com suas palavras onde e como usou:
            </p>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Ex.: usei ${kw.term} no projeto...`}
              rows={3}
              aria-label={`Descreva sua experiência com ${kw.term}`}
            />
            <p className="text-xs font-medium text-warning-strong">
              Inclua apenas o que você realmente pode comprovar em uma entrevista.
            </p>
            <Button
              size="sm"
              className="h-11 w-full bg-primary hover:bg-primary-hover"
              disabled={text.trim().length < 10 || declaring}
              onClick={() => {
                onDeclare(kw, text.trim());
                setAskOpen(false);
              }}
            >
              {declaring ? "Atualizando currículo…" : "Tenho essa experiência — incluir"}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function KeywordPanel({ keywords, onDeclare, declaring }: Props) {
  const found = keywords.filter((k) => k.found || k.declared);
  const missing = keywords
    .filter((k) => !k.found && !k.declared)
    .sort((a, b) => (a.importance === b.importance ? 0 : a.importance === "essencial" ? -1 : 1));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section aria-labelledby="kw-found">
        <h3 id="kw-found" className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
          <Check className="size-5 text-success" aria-hidden /> Encontradas ({found.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {found.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma palavra-chave da vaga foi encontrada ainda.</p>
          )}
          {found.map((kw) => (
            <Badge key={kw.term} kw={kw} onDeclare={onDeclare} declaring={declaring} />
          ))}
        </div>
      </section>
      <section aria-labelledby="kw-missing">
        <h3 id="kw-missing" className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
          <AlertTriangle className="size-5 text-warning" aria-hidden /> O que falta ({missing.length})
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Essas palavras nunca entram sozinhas no currículo. Toque em uma para dizer se você tem essa experiência.
        </p>
        <div className="flex flex-wrap gap-2">
          {missing.length === 0 && (
            <p className="text-sm text-muted-foreground">Nada faltando — seu currículo cobre todos os requisitos.</p>
          )}
          {missing.map((kw) => (
            <Badge key={kw.term} kw={kw} onDeclare={onDeclare} declaring={declaring} />
          ))}
        </div>
      </section>
    </div>
  );
}
