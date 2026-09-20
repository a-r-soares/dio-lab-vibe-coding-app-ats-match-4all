import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrength } from "@/components/PasswordStrength";
import { supabase } from "@/integrations/supabase/client";
import { isPasswordStrong } from "@/lib/password";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — ATS Match 4All" },
      { name: "description", content: "Defina uma nova senha para sua conta." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    setIsRecovery(window.location.hash.includes("type=recovery"));
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isPasswordStrong(password)) {
      toast.error("Escolha uma senha forte: veja os requisitos abaixo do campo.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível atualizar a senha. Abra o link do e-mail novamente.");
      return;
    }
    toast.success("Senha atualizada! Você já pode entrar.");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Redefinir senha</h1>
      {isRecovery ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
            />
            <PasswordStrength password={password} />
          </div>
          <Button type="submit" className="h-12 w-full bg-primary hover:bg-primary-hover" disabled={busy}>
            {busy ? "Salvando…" : "Salvar nova senha"}
          </Button>
        </form>
      ) : (
        <p className="mt-6 text-muted-foreground">
          Este link de redefinição não é válido ou expirou. Peça um novo na página de entrada, em
          "Esqueci minha senha".
        </p>
      )}
    </div>
  );
}
