import { Link } from "@tanstack/react-router";

export function AppFooter() {
  return (
    <footer className="border-t border-border py-6 text-sm text-muted-foreground">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
        <p>ATS Match 4All — apresente melhor o que você já viveu.</p>
        <nav className="flex gap-4" aria-label="Rodapé">
          <Link to="/privacidade" className="rounded underline-offset-4 hover:underline focus-ring">
            Privacidade
          </Link>
          <Link to="/termos" className="rounded underline-offset-4 hover:underline focus-ring">
            Termos de uso
          </Link>
        </nav>
      </div>
    </footer>
  );
}
