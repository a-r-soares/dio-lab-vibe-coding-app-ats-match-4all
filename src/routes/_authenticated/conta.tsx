import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrength } from "@/components/PasswordStrength";
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
import { supabase } from "@/integrations/supabase/client";
import { deleteAccount } from "@/lib/history.functions";
import { isPasswordStrong } from "@/lib/password";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({
    meta: [
      { title: "Conta e privacidade — ATS Match 4All" },
      { name: "description", content: "Gerencie sua senha e seus dados pessoais." },
    ],
  }),
  component: ContaPage,
});

function ContaPage() {
  const navigate = useNavigate();
  const deleteFn = useServerFn(deleteAccount);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!isPasswordStrong(newPassword)) {
      toast.error("Escolha uma senha forte: veja os requisitos abaixo do campo.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      current_password: currentPassword,
    } as never);
    setBusy(false);
    if (error) {
      toast.error("Não foi possível trocar a senha. Confira sua senha atual.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    toast.success("Senha atualizada.");
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await deleteFn();
      await supabase.auth.signOut();
      toast.success("Sua conta e todos os dados foram excluídos.");
      navigate({ to: "/", replace: true });
    } catch {
      toast.error("Não foi possível excluir agora. Tente de novo em instantes.");
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Conta e privacidade</h1>
        <p className="mt-2 text-muted-foreground">Gerencie sua senha e seus dados.</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Trocar senha</h2>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Senha atual</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12"
            />
            <PasswordStrength password={newPassword} />
          </div>
          <Button type="submit" className="h-12 bg-primary hover:bg-primary-hover" disabled={busy}>
            {busy ? "Salvando…" : "Atualizar senha"}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-destructive/40 bg-card p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-destructive">Excluir conta</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Isso apaga permanentemente sua conta e todas as análises salvas. Não há como desfazer.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4 h-12">
              Excluir minha conta e meus dados
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
              <AlertDialogDescription>
                Sua conta e todo o histórico de análises serão apagados agora. Essa ação não pode
                ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-11">Manter minha conta</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Excluindo…" : "Sim, excluir tudo"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
