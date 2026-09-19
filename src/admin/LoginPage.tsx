import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminRequest } from "./api";

export function LoginPage({ onAuthenticated }: { onAuthenticated: (session: { user: { email: string; role: "admin" }; csrfToken: string }) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      onAuthenticated(await adminRequest("/api/admin/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-sm">
        <div className="mb-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary"><LockKeyhole className="h-5 w-5" /></div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Monopólio Pods</p>
          <h1 className="mt-1 text-2xl font-semibold">Painel Administrativo</h1>
          <p className="mt-2 text-sm text-muted-foreground">Entre com sua conta administrativa.</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="admin-email">E-mail</Label><Input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="admin-password">Senha</Label><Input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button>
        </div>
      </form>
    </main>
  );
}
