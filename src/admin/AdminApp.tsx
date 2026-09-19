import * as React from "react";
import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { LogOut, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminRequest, setCsrfToken } from "./api";
import { LoginPage } from "./LoginPage";
import { ProductsPage } from "./ProductsPage";
import { ProductEditorPage } from "./ProductEditorPage";
import { SettingsPage } from "./SettingsPage";

interface Session {
  user: { email: string; role: "admin" };
  csrfToken: string;
}

export function AdminApp() {
  const [session, setSession] = React.useState<Session | null | undefined>(undefined);

  React.useEffect(() => {
    adminRequest<Session>("/api/admin/auth/session")
      .then((value) => {
        setCsrfToken(value.csrfToken);
        setSession(value);
      })
      .catch(() => setSession(null));
    const handleUnauthorized = () => {
      setCsrfToken("");
      setSession(null);
    };
    window.addEventListener("admin:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("admin:unauthorized", handleUnauthorized);
  }, []);

  if (session === undefined) {
    return <div className="flex min-h-screen items-center justify-center bg-muted text-sm text-muted-foreground">Validando sessão...</div>;
  }
  if (!session) {
    return (
      <LoginPage
        onAuthenticated={(value) => {
          setCsrfToken(value.csrfToken);
          setSession(value);
        }}
      />
    );
  }
  return <AdminShell session={session} onLogout={() => setSession(null)} />;
}

function AdminShell({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const navigate = useNavigate();
  const logout = async () => {
    try {
      await adminRequest<void>("/api/admin/auth/logout", { method: "POST" });
    } finally {
      setCsrfToken("");
      onLogout();
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Monopólio Pods</p>
            <h1 className="text-lg font-semibold">Painel Administrativo</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => void logout()}>
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:grid-cols-[220px_1fr] md:px-6">
        <aside className="rounded-lg border border-border bg-background p-2 md:sticky md:top-24 md:h-fit">
          <nav className="grid grid-cols-2 gap-1 md:grid-cols-1">
            <AdminNavLink to="/products" icon={Package}>Produtos</AdminNavLink>
            <AdminNavLink to="/settings" icon={Settings}>Configurações</AdminNavLink>
          </nav>
          <p className="mt-4 hidden border-t border-border px-3 pt-4 text-xs text-muted-foreground md:block">{session.user.email}</p>
        </aside>
        <main className="min-w-0">
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/new" element={<ProductEditorPage />} />
            <Route path="/products/:id" element={<ProductEditorPage />} />
            <Route path="/settings" element={<SettingsPage email={session.user.email} />} />
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AdminNavLink({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
    >
      <Icon className="h-4 w-4" /> {children}
    </NavLink>
  );
}
