import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Store, FolderTree, Package, CheckCircle2, Settings, LogOut, TrendingUp, Check, X, Edit, Trash2, Plus, Eye } from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { RoleGate, WorkspaceTopbar } from "@/components/site/RoleWorkspace";
import { Footer } from "@/components/site/Footer";
import { categoryShare } from "@/lib/mock-data";
import {
  createCategory, deleteCategory, fetchCategoriesRaw, fetchProducts, fetchSellers, fetchUsers,
  toggleUserBlocked, updateCategory, updateSellerStatus, type AdminUser, type CategoryDto, type Seller,
} from "@/lib/api";

const COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899", "#64748B"];
type Tab = "dashboard" | "utilisateurs" | "vendeurs" | "boutiques" | "categories" | "parametres";

export function AdminPage() {
  return (
    <RoleGate area="admin" fallbackRole="admin">
      <AdminContent />
    </RoleGate>
  );
}

function AdminContent() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const nav: { id: Tab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "utilisateurs", label: "Utilisateurs", icon: Users },
    { id: "vendeurs", label: "Demandes vendeurs", icon: Store },
    { id: "boutiques", label: "Boutiques", icon: Store },
    { id: "categories", label: "Categories", icon: FolderTree },
    { id: "parametres", label: "Parametres", icon: Settings },
  ];

  useEffect(() => { document.title = "Administration | SenBazar"; }, []);

  return (
    <div className="min-h-screen bg-background antialiased">
      <WorkspaceTopbar title="Administration SenBazar" subtitle="Pilotage global, boutiques, commandes et securite" tone="admin" />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-border/60 bg-card p-4 h-fit md:sticky md:top-28 shadow-sm">
            <div className="mb-4 flex items-center gap-3 border-b border-border/40 pb-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-foreground text-background text-sm font-black shadow-md">A</div>
              <div className="min-w-0">
                <div className="font-display font-black text-sm text-foreground truncate">Super Admin</div>
                <div className="text-[10px] bg-foreground/10 text-foreground inline-block px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide mt-0.5">Administration</div>
              </div>
            </div>

            <nav className="space-y-1">
              {nav.map((n) => {
                const Icon = n.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => setTab(n.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${tab === n.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    <Icon className="h-4 w-4 stroke-[2]" /> {n.label}
                  </button>
                );
              })}
              <button
                onClick={() => navigate("/")}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all mt-4"
              >
                <LogOut className="h-4 w-4 stroke-[2]" /> Retour boutique
              </button>
            </nav>
          </aside>

          <section className="min-w-0 space-y-6">
            {tab === "dashboard" && <AdminDashboard />}
            {tab === "utilisateurs" && <UsersAdmin />}
            {tab === "vendeurs" && <SellersAdmin />}
            {tab === "boutiques" && <ShopsAdmin />}
            {tab === "categories" && <CategoriesAdmin />}
            {tab === "parametres" && <SettingsAdmin />}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function AdminDashboard() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [sellerCount, setSellerCount] = useState<number | null>(null);
  const [activeShopCount, setActiveShopCount] = useState<number | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers().then((u) => setUserCount(u.length)).catch(() => setUserCount(null));
    fetchSellers().then((s) => {
      setSellerCount(s.length);
      setActiveShopCount(s.filter((x) => x.statut === "VALIDE").length);
    }).catch(() => { setSellerCount(null); setActiveShopCount(null); });
    fetchProducts().then((p) => setProductCount(p.length)).catch(() => setProductCount(null));
  }, []);

  const cards = [
    { l: "Utilisateurs globaux", v: userCount == null ? "..." : String(userCount), i: Users, d: "Comptes enregistres" },
    { l: "Vendeurs", v: sellerCount == null ? "..." : String(sellerCount), i: Store, d: "Boutiques sur la plateforme" },
    { l: "Boutiques actives", v: activeShopCount == null ? "..." : String(activeShopCount), i: CheckCircle2, d: "Validees par l'administration" },
    { l: "Produits en ligne", v: productCount == null ? "..." : String(productCount), i: Package, d: "Catalogue global" },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => (
          <div key={s.l} className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">{s.l}</span>
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <s.i className="h-4 w-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-3 font-display text-xl font-black text-foreground tracking-tight">{s.v}</div>
            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 w-fit px-1.5 py-0.5 rounded-md">
              <TrendingUp className="h-3 w-3" /> {s.d}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
        <h3 className="mb-4 font-display text-sm font-black text-foreground">Repartition du catalogue par categorie</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={categoryShare} dataKey="value" nameKey="name" outerRadius={90} paddingAngle={3}>
              {categoryShare.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 11 }} formatter={(v: number) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: 11, fontWeight: "bold" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function UsersAdmin() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string>("tous");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); fetchUsers().then(setUsers).finally(() => setLoading(false)); };
  useEffect(load, []);

  const list = users.filter((u) => (role === "tous" || u.role === role) && (u.nom.toLowerCase().includes(q.toLowerCase()) || u.email.includes(q)));

  const [viewing, setViewing] = useState<AdminUser | null>(null);

  const toggle = async (u: AdminUser) => {
    try {
      await toggleUserBlocked(u.id, !u.bloque);
      toast.success(u.bloque ? "Compte debloque" : "Compte bloque");
      load();
    } catch {
      toast.error("Action impossible");
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-base font-black text-foreground">Gestion des comptes</h2>
        <div className="flex gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 h-9 text-xs font-bold text-foreground/80 outline-none"
          >
            <option value="tous">Tous les roles</option>
            <option value="ACHETEUR">Client</option>
            <option value="VENDEUR">Vendeur</option>
            <option value="ADMIN">Admin</option>
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher nom, email..."
            className="rounded-xl border border-border bg-background px-3 h-9 text-xs font-semibold outline-none focus:border-primary w-52"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-xs font-semibold text-muted-foreground text-center py-8">Chargement...</p>
      ) : (
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead>
              <tr className="text-muted-foreground/80 font-bold uppercase text-[10px] tracking-wider border-b border-border/40">
                <th className="pb-3">Nom</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role systeme</th>
                <th className="pb-3">Date inscription</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-semibold text-foreground/90">
              {list.map((u) => (
                <tr key={u.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 font-bold text-foreground">{u.nom}</td>
                  <td className="py-3.5 text-muted-foreground">{u.email}</td>
                  <td className="py-3.5">
                    <span className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-bold text-foreground/80">{u.role}</span>
                  </td>
                  <td className="py-3.5 text-muted-foreground font-medium">{new Date(u.dateInscription).toLocaleDateString("fr-FR")}</td>
                  <td className="py-3.5"><Badge s={u.bloque ? "Bloque" : "Actif"} /></td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => setViewing(u)}
                      className="mr-1.5 inline-grid h-8 w-8 place-items-center rounded-xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition shadow-2xs"
                      title="Voir details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => toggle(u)}
                      className={`rounded-xl border px-3 h-8 text-xs font-bold transition shadow-2xs ${u.bloque ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100" : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"}`}
                    >
                      {u.bloque ? "Debloquer" : "Bloquer"}
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Aucun utilisateur.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {viewing && <UserDetailsModal user={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function UserDetailsModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-black text-foreground">{user.nom}</h3>
            <Badge s={user.bloque ? "Bloque" : "Actif"} />
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground hover:text-foreground transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        <dl className="space-y-2.5 text-xs">
          <div className="flex justify-between gap-3"><dt className="font-bold text-muted-foreground">Identifiant</dt><dd className="font-semibold text-foreground">#{user.id}</dd></div>
          <div className="flex justify-between gap-3"><dt className="font-bold text-muted-foreground">Email</dt><dd className="font-semibold text-foreground">{user.email}</dd></div>
          <div className="flex justify-between gap-3"><dt className="font-bold text-muted-foreground">Role systeme</dt><dd className="font-semibold text-foreground">{user.role}</dd></div>
          <div className="flex justify-between gap-3"><dt className="font-bold text-muted-foreground">Telephone</dt><dd className="font-semibold text-foreground">{user.telephone || "Non renseigne"}</dd></div>
          <div className="flex justify-between gap-3"><dt className="font-bold text-muted-foreground">Adresse</dt><dd className="font-semibold text-foreground">{user.adresse || "Non renseignee"}</dd></div>
          <div className="flex justify-between gap-3"><dt className="font-bold text-muted-foreground">Date d'inscription</dt><dd className="font-semibold text-foreground">{new Date(user.dateInscription).toLocaleDateString("fr-FR")}</dd></div>
        </dl>
        <button onClick={onClose} className="w-full rounded-xl border border-border bg-background h-10 text-xs font-bold text-foreground/80">Fermer</button>
      </div>
    </div>
  );
}

function SellersAdmin() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); fetchSellers().then(setSellers).finally(() => setLoading(false)); };
  useEffect(load, []);

  const pending = sellers.filter((s) => s.statut === "EN_ATTENTE");

  const decide = async (s: Seller, statut: "VALIDE" | "BLOQUE") => {
    try {
      await updateSellerStatus(s, statut);
      toast.success(statut === "VALIDE" ? `Le compte marchand de ${s.nomBoutique} a ete valide.` : `La demande de ${s.nomBoutique} a ete declinee.`);
      load();
    } catch {
      toast.error("Action impossible");
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
      <div className="mb-4">
        <h2 className="font-display text-base font-black text-foreground">Validation des dossiers vendeurs</h2>
        <p className="text-xs font-medium text-muted-foreground">Examinez les nouvelles demandes d'ouverture de boutique pro.</p>
      </div>

      {loading ? (
        <p className="text-xs font-semibold text-muted-foreground text-center py-4">Chargement...</p>
      ) : (
        <div className="space-y-3">
          {pending.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-muted/10 p-4 transition hover:border-border">
              <div>
                <div className="font-display font-black text-sm text-foreground">{s.nomBoutique}</div>
                <div className="text-xs font-medium text-muted-foreground mt-0.5">Proprietaire : {s.ownerNom}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => decide(s, "VALIDE")}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-4 h-9 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
                >
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" /> Valider
                </button>
                <button
                  onClick={() => decide(s, "BLOQUE")}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-4 h-9 text-xs font-bold text-rose-600 hover:bg-rose-100 transition shadow-2xs"
                >
                  <X className="h-3.5 w-3.5 stroke-[2.5]" /> Refuser
                </button>
              </div>
            </div>
          ))}
          {pending.length === 0 && (
            <p className="text-xs font-semibold text-muted-foreground text-center py-4">Aucun dossier en attente d'approbation.</p>
          )}
        </div>
      )}
    </div>
  );
}

const sellerStatusLabel: Record<Seller["statut"], string> = { EN_ATTENTE: "En attente", VALIDE: "Active", BLOQUE: "Bloquee" };
const sellerStatusClass: Record<Seller["statut"], string> = {
  VALIDE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  EN_ATTENTE: "bg-amber-50 text-amber-700 border border-amber-200",
  BLOQUE: "bg-rose-50 text-rose-700 border border-rose-200",
};

function ShopsAdmin() {
  const [status, setStatus] = useState<"tous" | Seller["statut"]>("tous");
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Seller | null>(null);
  const load = () => { setLoading(true); fetchSellers().then(setSellers).finally(() => setLoading(false)); };
  useEffect(load, []);

  const list = sellers.filter((s) => status === "tous" || s.statut === status);

  const setShopStatus = async (s: Seller, next: Seller["statut"]) => {
    try {
      await updateSellerStatus(s, next);
      toast.success(`${s.nomBoutique} : statut ${sellerStatusLabel[next].toLowerCase()}`);
      load();
    } catch {
      toast.error("Action impossible");
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-black text-foreground">Liste des boutiques</h2>
          <p className="text-xs font-medium text-muted-foreground">Suivi des boutiques, de leur statut et de leur proprietaire.</p>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-bold outline-none">
          <option value="tous">Toutes les boutiques</option>
          <option value="VALIDE">Actives</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="BLOQUE">Bloquees</option>
        </select>
      </div>

      {loading ? (
        <p className="text-xs font-semibold text-muted-foreground text-center py-8">Chargement...</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {list.map((shop) => (
            <div key={shop.id} className="rounded-2xl border border-border/60 bg-muted/10 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display text-sm font-black text-foreground">{shop.nomBoutique}</div>
                  <div className="mt-0.5 text-[11px] font-semibold text-muted-foreground">#{shop.id} - Proprietaire : {shop.ownerNom}</div>
                </div>
                <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase ${sellerStatusClass[shop.statut]}`}>{sellerStatusLabel[shop.statut]}</span>
              </div>
              <p className="mb-3 text-xs font-medium text-muted-foreground">{shop.description || "Aucune description renseignee."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {shop.statut === "EN_ATTENTE" && (
                  <>
                    <button onClick={() => setShopStatus(shop, "VALIDE")} className="rounded-xl bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground hover:bg-primary/95">Valider</button>
                    <button onClick={() => setShopStatus(shop, "BLOQUE")} className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-100">Refuser</button>
                  </>
                )}
                {shop.statut === "VALIDE" && (
                  <>
                    <button onClick={() => setViewing(shop)} className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-[11px] font-bold text-foreground/80 hover:bg-muted/70">
                      <Eye className="h-3.5 w-3.5" /> Voir details
                    </button>
                    <button onClick={() => setShopStatus(shop, "BLOQUE")} className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-100">Bloquer</button>
                  </>
                )}
                {shop.statut === "BLOQUE" && (
                  <>
                    <button onClick={() => setShopStatus(shop, "VALIDE")} className="rounded-xl bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground hover:bg-primary/95">Reactiver</button>
                    <button onClick={() => setViewing(shop)} className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-[11px] font-bold text-foreground/80 hover:bg-muted/70">
                      <Eye className="h-3.5 w-3.5" /> Voir details
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="col-span-2 text-center text-xs font-semibold text-muted-foreground py-8">Aucune boutique.</p>}
        </div>
      )}

      {viewing && <ShopDetailsModal shop={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function ShopDetailsModal({ shop, onClose }: { shop: Seller; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-black text-foreground">{shop.nomBoutique}</h3>
            <span className={`mt-1 inline-flex rounded-lg px-2 py-0.5 text-[10px] font-black uppercase ${sellerStatusClass[shop.statut]}`}>{sellerStatusLabel[shop.statut]}</span>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground hover:text-foreground transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        <dl className="space-y-2.5 text-xs">
          <div className="flex justify-between gap-3"><dt className="font-bold text-muted-foreground">Identifiant boutique</dt><dd className="font-semibold text-foreground">#{shop.id}</dd></div>
          <div className="flex justify-between gap-3"><dt className="font-bold text-muted-foreground">Proprietaire</dt><dd className="font-semibold text-foreground">{shop.ownerNom}</dd></div>
          <div className="flex justify-between gap-3"><dt className="font-bold text-muted-foreground">Compte utilisateur</dt><dd className="font-semibold text-foreground">#{shop.utilisateurId}</dd></div>
          <div>
            <dt className="mb-1 font-bold text-muted-foreground">Description</dt>
            <dd className="font-medium text-foreground/90">{shop.description || "Aucune description renseignee."}</dd>
          </div>
        </dl>
        <button onClick={onClose} className="w-full rounded-xl border border-border bg-background h-10 text-xs font-bold text-foreground/80">Fermer</button>
      </div>
    </div>
  );
}

function CategoriesAdmin() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CategoryDto | null>(null);
  const [editName, setEditName] = useState("");

  const load = () => { setLoading(true); fetchCategoriesRaw().then(setCategories).finally(() => setLoading(false)); };
  useEffect(load, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategory({ nom: name.trim() });
      toast.success(`La categorie "${name}" a ete correctement creee.`);
      setName("");
      load();
    } catch {
      toast.error("Cette categorie existe peut-etre deja");
    }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await updateCategory(editing.id, { nom: editName, description: editing.description, image: editing.image });
      toast.success("Categorie mise a jour");
      setEditing(null);
      load();
    } catch {
      toast.error("Mise a jour impossible");
    }
  };

  const remove = async (c: CategoryDto) => {
    if (!confirm(`Archiver la categorie "${c.nom}" ?`)) return;
    try {
      await deleteCategory(c.id);
      toast.success("La categorie a ete archivee");
      load();
    } catch {
      toast.error("Suppression impossible (des produits y sont peut-etre encore rattaches)");
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
      <div className="mb-4">
        <h2 className="font-display text-base font-black text-foreground">Arborescence des categories</h2>
        <p className="text-xs font-medium text-muted-foreground">Structurez l'indexation des articles sur SenBazar.</p>
      </div>

      <form onSubmit={submit} className="mb-5 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Artisanat d'art, Beaute..."
          className="flex-1 rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold outline-none focus:border-primary transition"
          required
        />
        <button type="submit" className="flex items-center gap-1.5 rounded-xl bg-primary px-4 h-10 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shadow-sm">
          <Plus className="h-4 w-4 stroke-[2.5]" /> Ajouter
        </button>
      </form>

      {loading ? (
        <p className="text-xs font-semibold text-muted-foreground text-center py-4">Chargement...</p>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/5 p-3.5 hover:bg-card hover:border-border transition-all shadow-2xs">
              <div>
                <div className="font-bold text-sm text-foreground">{c.nom}</div>
                <div className="text-xs font-bold text-muted-foreground/70 mt-0.5">{c.description || "Sans description"}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(c); setEditName(c.nom); }} className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground/80 hover:text-foreground transition">
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => remove(c)} className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={saveEdit} className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl space-y-3">
            <h3 className="font-display text-sm font-black text-foreground">Renommer la categorie</h3>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} required className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold outline-none focus:border-primary" />
            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 rounded-xl bg-primary h-10 text-xs font-bold text-primary-foreground">Enregistrer</button>
              <button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-border h-10 px-4 text-xs font-bold text-foreground/80">Annuler</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function SettingsAdmin() {
  return (
    <form onSubmit={(e) => { e.preventDefault(); toast.success("Les variables de configuration ont ete sauvegardees."); }} className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
      <div className="mb-5">
        <h2 className="font-display text-lg font-black text-foreground">Variables de configuration globale</h2>
        <p className="text-xs font-medium text-muted-foreground">Ajustez les parametres fondamentaux de fonctionnement du systeme.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Nom d'usage de la plateforme</span>
          <input defaultValue="SenBazar" required className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold text-foreground outline-none focus:border-primary transition focus:ring-2 focus:ring-primary/10" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Courriel de contact (Support/Technique)</span>
          <input type="email" defaultValue="hello@senbazar.sn" required className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold text-foreground outline-none focus:border-primary transition focus:ring-2 focus:ring-primary/10" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Commission par defaut prelevee sur les ventes (%)</span>
          <input type="number" defaultValue="8" min={0} max={100} required className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold text-foreground outline-none focus:border-primary transition focus:ring-2 focus:ring-primary/10" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Devise monetaire de reference</span>
          <input defaultValue="FCFA" disabled className="w-full rounded-xl border border-border bg-muted/60 h-10 px-3 text-xs font-semibold text-muted-foreground cursor-not-allowed outline-none" />
        </label>
      </div>

      <button type="submit" className="mt-6 rounded-xl bg-primary h-11 px-6 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shadow-sm">
        Mettre a jour la configuration
      </button>
    </form>
  );
}

function Badge({ s }: { s: string }) {
  const map: Record<string, string> = {
    Actif: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
    Bloque: "bg-rose-50 text-rose-700 border border-rose-200/50",
  };
  return <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${map[s] ?? "bg-muted"}`}>{s}</span>;
}
