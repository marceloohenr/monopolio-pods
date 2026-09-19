import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminRequest } from "./api";

export function SettingsPage({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmation) return toast.error("A confirmação da nova senha não confere.");
    setLoading(true);
    try {
      await adminRequest<void>("/api/admin/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) });
      setCurrentPassword(""); setNewPassword(""); setConfirmation("");
      toast.success("Senha alterada com sucesso.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível alterar a senha."); }
    finally { setLoading(false); }
  };

  return (
    <section className="max-w-xl space-y-5">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Conta</p><h2 className="mt-1 text-2xl font-semibold">Configurações</h2><p className="mt-1 text-sm text-muted-foreground">Conta administrativa: {email}</p></div>
      <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-background p-5">
        <div className="space-y-1.5"><Label htmlFor="current-password">Senha atual</Label><Input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="new-password">Nova senha</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /><p className="text-xs text-muted-foreground">Use pelo menos 12 caracteres.</p></div>
        <div className="space-y-1.5"><Label htmlFor="confirm-password">Confirmar nova senha</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={12} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>
        <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Alterar senha"}</Button>
      </form>
    </section>
  );
}
