import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { FileSearch, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";

import { useTheme } from "@/components/theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function AppHeader() {
  const { theme, toggle } = useTheme();
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 rounded-md focus-ring" aria-label="ATS Match 4All — início">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileSearch className="size-5" aria-hidden />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">ATS Match 4All</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            className="size-11"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>

          {email ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 gap-2">
                  <User className="size-4" aria-hidden />
                  <span className="hidden max-w-40 truncate sm:inline">{email}</span>
                  <Menu className="size-4 sm:hidden" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/historico">Meu histórico</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard de evolução</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/conta">Conta e privacidade</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="size-4" aria-hidden /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="h-11 bg-primary hover:bg-primary-hover">
              <Link to="/auth">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
