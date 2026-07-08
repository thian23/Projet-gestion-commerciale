import { Link, useNavigate } from "react-router-dom";
import { LogOut, Phone, Store, Shield, ArrowLeft } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { authActions, useUser, type Role } from "@/lib/auth-store";
import { canAccessArea, defaultRedirectForRole, getRoleAccess, PLATFORM_PHONE_DISPLAY, PLATFORM_PHONE_LINK, type AccessArea } from "@/lib/tenant";

type RoleGateProps = {
  area: AccessArea;
  fallbackRole?: Role;
  children: ReactNode;
};

export function RoleGate({ area, fallbackRole, children }: RoleGateProps) {
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (canAccessArea(user.role, area)) return;
    if (user.role === "visiteur") {
      navigate(fallbackRole ? `/connexion?role=${fallbackRole}` : "/connexion");
      return;
    }
    navigate(defaultRedirectForRole(user.role));
  }, [area, fallbackRole, navigate, user.role]);

  if (!canAccessArea(user.role, area)) return null;
  return <>{children}</>;
}

type WorkspaceTopbarProps = {
  title: string;
  subtitle: string;
  tone: "admin" | "seller";
};

export function WorkspaceTopbar({ title, subtitle, tone }: WorkspaceTopbarProps) {
  const user = useUser();
  const navigate = useNavigate();
  const access = getRoleAccess(user);
  const Icon = tone === "admin" ? Shield : Store;
  const toneClass = tone === "admin" ? "bg-foreground text-background" : "bg-amber-500 text-white";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-sm font-black text-foreground sm:text-base">{title}</h1>
              <span className="hidden rounded-full bg-muted px-2 py-0.5 text-[10px] font-black uppercase text-muted-foreground sm:inline-flex">{access.label}</span>
            </div>
            <p className="truncate text-[11px] font-semibold text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href={PLATFORM_PHONE_LINK} className="hidden items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-[11px] font-bold text-foreground/80 sm:inline-flex">
            <Phone className="h-3.5 w-3.5 text-primary" /> {PLATFORM_PHONE_DISPLAY}
          </a>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-[11px] font-bold text-foreground/80 hover:bg-muted">
            <ArrowLeft className="h-3.5 w-3.5" /> Boutique
          </Link>
          <button
            onClick={() => { authActions.logout(); navigate("/"); }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-100"
          >
            <LogOut className="h-3.5 w-3.5" /> Sortir
          </button>
        </div>
      </div>
    </header>
  );
}
