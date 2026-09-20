import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PasswordStrength } from "@/components/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { isPasswordStrong } from "@/lib/password";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — ATS Match 4All" },
      { name: "description", content: "Entre ou crie sua conta para salvar o histórico de análises." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível entrar. Confira e-mail e senha.");
      return;
    }
    navigate({ to: "/", replace: true });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!isPasswordStrong(password, { email })) {
      toast.error("Escolha uma senha forte: veja os requisitos abaixo do campo.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível criar a conta. Tente outro e-mail ou aguarde um instante.");
      return;
    }
    if (!data.session) {
      toast.success("Conta criada! Confirme seu e-mail para começar a salvar análises.");
    } else {
      navigate({ to: "/", replace: true });
    }
  }


  async function handleForgot() {
    if (!email.trim()) {
      toast.error("Digite seu e-mail para enviarmos o link de redefinição.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error("Não foi possível enviar o e-mail agora. Tente de novo em instantes.");
    else toast.success("Se o e-mail estiver cadastrado, você receberá o link de redefinição.");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Entrar no ATS Match 4All</h1>
      <p className="mt-2 text-muted-foreground">
        Você pode analisar sem conta. Com uma conta, seu histórico fica salvo e você acompanha sua evolução.
      </p>

      <Tabs defaultValue="signin" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin" className="h-11">Entrar</TabsTrigger>
          <TabsTrigger value="signup" className="h-11">Criar conta</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <form onSubmit={handleSignIn} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="signin-email">E-mail</Label>
              <Input
                id="signin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signin-password">Senha</Label>
              <Input
                id="signin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
              />
            </div>
            <Button type="submit" className="h-12 w-full bg-primary hover:bg-primary-hover" disabled={busy}>
              {busy ? "Entrando…" : "Entrar"}
            </Button>
            <button
              type="button"
              onClick={handleForgot}
              className="w-full rounded-md py-2 text-sm text-primary underline-offset-4 hover:underline focus-ring"
            >
              Esqueci minha senha
            </button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignUp} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="signup-email">E-mail</Label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-password">Senha</Label>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
              />
              <PasswordStrength password={password} email={email} />
            </div>
            <Button type="submit" className="h-12 w-full bg-primary hover:bg-primary-hover" disabled={busy}>
              {busy ? "Criando…" : "Criar conta"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Ao criar a conta, você concorda com os Termos de uso e a Política de privacidade.
            </p>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
