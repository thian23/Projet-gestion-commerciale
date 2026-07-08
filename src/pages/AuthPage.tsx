import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { User, Store, Shield, Mail, Lock, UserCircle, ArrowRight, Eye, EyeOff, Building2 } from "lucide-react";
import { toast } from "sonner";
import { authActions, type Role } from "@/lib/auth-store";
import { apiLogin, apiRegister, syncGuestCartToServer } from "@/lib/api";
import { useCart, cartActions } from "@/lib/cart-store";

const roleCards: { id: Role; nom: string; desc: string; icon: any; color: string }[] = [
  { id: "client", nom: "Client", desc: "Acheter des produits", icon: User, color: "from-emerald-500 to-emerald-600" },
  { id: "vendeur", nom: "Vendeur", desc: "Vendre mes produits", icon: Store, color: "from-orange-500 to-amber-600" },
];

const demoAccounts = [
  { email: "client@senbazar.sn", role: "Client", desc: "Acheteur" },
  { email: "vendeur@senbazar.sn", role: "Vendeur", desc: "Atelier Dakar" },
  { email: "admin@senbazar.sn", role: "Admin", desc: "Super admin" },
];

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const [searchParams] = useSearchParams();
  const initRole = searchParams.get("role");
  const [role, setRole] = useState<Role>(initRole === "vendeur" ? "vendeur" : "client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [nomBoutique, setNomBoutique] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const cart = useCart();

  useEffect(() => {
    document.title = mode === "login" ? "Connexion a SenBazar" : "Inscription a SenBazar";
  }, [mode]);

  const afterAuth = async (user: Awaited<ReturnType<typeof apiLogin>>) => {
    authActions.setUser(user);
    if (cart.length > 0) {
      await syncGuestCartToServer(user.id, cart.map((c) => ({ productId: c.product.id, quantite: c.quantity })));
      cartActions.clear();
    }
    toast.success(`Bienvenue ${user.nom}`);
    navigate(user.role === "admin" ? "/admin" : user.role === "vendeur" ? "/vendeur" : "/compte");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = mode === "login"
        ? await apiLogin(email, password)
        : await apiRegister(nom, email, password, role, role === "vendeur" ? nomBoutique : undefined);
      await afterAuth(user);
    } catch {
      toast.error(mode === "login" ? "Identifiants invalides" : "Inscription impossible (email deja utilise ?)");
    } finally {
      setSubmitting(false);
    }
  };

  const quickLogin = async (demoEmail: string) => {
    setEmail(demoEmail); setPassword("password");
    try {
      const user = await apiLogin(demoEmail, "password");
      await afterAuth(user);
    } catch {
      toast.error("Connexion impossible (le backend est-il demarre et re-seed ?)");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_1fr] lg:items-center">
        {/* Left panel */}
        <div className="hidden lg:block">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground font-black shadow-lg">S</div>
            <span className="font-display text-2xl font-black">Sen<span className="text-primary">Bazar</span></span>
          </Link>
          <h1 className="font-display text-4xl font-black leading-tight">La marketplace<br />qui rassemble<br /><span className="text-primary">tout le Senegal</span>.</h1>
          <p className="mt-4 text-muted-foreground max-w-md">Achetez aupres de vendeurs de confiance ou lancez votre boutique en quelques clics.</p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Comptes de demonstration</div>
            <div className="space-y-2">
              {demoAccounts.map((d) => (
                <button key={d.email} onClick={() => quickLogin(d.email)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-3 text-left hover:border-primary hover:bg-muted/40 transition">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{d.role}</div>
                    <div className="text-xs text-muted-foreground truncate">{d.email}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">Mot de passe des comptes demo : <span className="font-bold">password</span></p>
          </div>
        </div>

        {/* Form panel */}
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
            <Link to="/" className="mb-4 flex items-center gap-2 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground font-black">S</div>
              <span className="font-display text-xl font-black">SenBazar</span>
            </Link>

            <h2 className="font-display text-2xl font-black">{mode === "login" ? "Connexion" : "Creer un compte"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "login" ? "Content de vous revoir" : "Rejoignez la communaute SenBazar"}
            </p>

            {mode === "register" && (
              <div className="mt-5">
                <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Je suis</div>
                <div className="grid grid-cols-2 gap-2">
                  {roleCards.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button key={r.id} type="button" onClick={() => setRole(r.id)} className={`rounded-xl border-2 p-3 text-left transition ${role === r.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                        <div className={`mb-1 grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${r.color} text-white`}><Icon className="h-4 w-4" /></div>
                        <div className="text-sm font-semibold">{r.nom}</div>
                        <div className="text-[10px] text-muted-foreground">{r.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={submit} className="mt-5 space-y-3">
              {mode === "register" && (
                <Field icon={UserCircle} label="Nom complet" required>
                  <input value={nom} onChange={(e) => setNom(e.target.value)} required placeholder="Aissatou Diop" className="w-full bg-transparent outline-none text-sm" />
                </Field>
              )}
              {mode === "register" && role === "vendeur" && (
                <Field icon={Building2} label="Nom de la boutique" required>
                  <input value={nomBoutique} onChange={(e) => setNomBoutique(e.target.value)} required placeholder="Ma Boutique SN" className="w-full bg-transparent outline-none text-sm" />
                </Field>
              )}
              <Field icon={Mail} label="Email" required>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="vous@email.sn" className="w-full bg-transparent outline-none text-sm" />
              </Field>
              <Field icon={Lock} label="Mot de passe" required>
                <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} placeholder="********" className="w-full bg-transparent outline-none text-sm" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-muted-foreground shrink-0">{showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </Field>

              {mode === "login" && (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> Se souvenir</label>
                  <button type="button" className="text-primary hover:underline">Mot de passe oublie ?</button>
                </div>
              )}

              <button type="submit" disabled={submitting} className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition disabled:opacity-50">
                {submitting ? "Veuillez patienter..." : mode === "login" ? "Se connecter" : "Creer mon compte"}
              </button>
            </form>

            <div className="mt-5 text-center text-sm">
              {mode === "login" ? (
                <>Pas encore de compte ? <Link to={`/inscription${initRole ? `?role=${initRole}` : ""}`} className="font-semibold text-primary hover:underline">Inscription</Link></>
              ) : (
                <>Deja membre ? <Link to="/connexion" className="font-semibold text-primary hover:underline">Connexion</Link></>
              )}
            </div>

            <div className="mt-4 rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground lg:hidden">
              <strong className="text-foreground">Demo :</strong> client@senbazar.sn - vendeur@senbazar.sn - admin@senbazar.sn (mdp: password)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, required, children }: { icon: any; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}{required && " *"}</span>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 focus-within:ring-2 focus-within:ring-ring">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        {children}
      </div>
    </label>
  );
}
