import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, PlusCircle, ShoppingBag, Store, LogOut, TrendingUp, Users, DollarSign, Search, Edit, Trash2, Eye, X } from "lucide-react";
import { toast } from "sonner";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { RoleGate, WorkspaceTopbar } from "@/components/site/RoleWorkspace";
import { Footer } from "@/components/site/Footer";
import { OrderDetailModal } from "@/components/site/OrderDetailModal";
import { formatFCFA, type Product } from "@/lib/mock-data";
import { useUser } from "@/lib/auth-store";
import {
  createProduct, deleteProduct, fetchCategoriesRaw, fetchOrderDetails, fetchOrdersForSeller, fetchProductsBySeller,
  fetchSeller, orderStatusColor, updateProduct, updateShopProfile, type CategoryDto, type Order, type OrderDetail, type Seller,
} from "@/lib/api";

const COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899", "#64748B"];
type Tab = "dashboard" | "produits" | "commandes" | "boutique";

export function VendeurPage() {
  return (
    <RoleGate area="seller" fallbackRole="vendeur">
      <VendeurContent />
    </RoleGate>
  );
}

function VendeurContent() {
  const user = useUser();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const nav: { id: Tab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "produits", label: "Mes produits", icon: Package },
    { id: "commandes", label: "Mes commandes", icon: ShoppingBag },
    { id: "boutique", label: "Ma boutique", icon: Store },
  ];

  useEffect(() => { document.title = "Espace vendeur | SenBazar"; }, []);

  const vendeurId = user.vendeurId;

  return (
    <div className="min-h-screen bg-background antialiased">
      <WorkspaceTopbar title="Espace vendeur" subtitle="Boutique, produits, commandes et chiffres de vente" tone="seller" />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-border/60 bg-card p-4 h-fit md:sticky md:top-28 shadow-sm">
            <div className="mb-4 flex items-center gap-3 border-b border-border/40 pb-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold shadow-md shadow-amber-500/15">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-black text-sm text-foreground truncate">{user.nom}</div>
                <div className="text-[10px] bg-amber-500/10 text-amber-600 inline-block px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide mt-0.5">Vendeur Pro</div>
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
            {!vendeurId ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-xs font-bold text-muted-foreground">
                Aucune boutique n'est encore rattachee a ce compte.
              </div>
            ) : (
              <>
                {tab === "dashboard" && <SellerDashboard vendeurId={vendeurId} />}
                {tab === "produits" && <SellerProducts vendeurId={vendeurId} />}
                {tab === "commandes" && <SellerOrdersView vendeurId={vendeurId} />}
                {tab === "boutique" && <ShopForm vendeurId={vendeurId} />}
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function SellerDashboard({ vendeurId }: { vendeurId: string }) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProductsBySeller(vendeurId), fetchOrdersForSeller(vendeurId)])
      .then(([p, o]) => { setProducts(p); setOrders(o); })
      .finally(() => setLoading(false));
  }, [vendeurId]);

  const revenue = orders.filter((o) => o.statut !== "ANNULEE").reduce((sum, o) => sum + o.montantTotal, 0);
  const uniqueClients = new Set(orders.map((o) => o.utilisateurId)).size;

  const cards = [
    { l: "Produits actifs", v: loading ? "-" : String(products.length), i: Package, d: "En ligne sur la marketplace" },
    { l: "Commandes", v: loading ? "-" : String(orders.length), i: ShoppingBag, d: "Toutes periodes confondues" },
    { l: "Chiffre d'affaires", v: loading ? "-" : formatFCFA(revenue), i: DollarSign, d: "Cumul des ventes reelles" },
    { l: "Clients uniques", v: loading ? "-" : String(uniqueClients), i: Users, d: "Acheteurs distincts" },
  ];

  const monthly = new Map<string, { ventes: number; commandes: number; clients: Set<string> }>();
  orders.forEach((o) => {
    const key = new Date(o.date).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    const entry = monthly.get(key) ?? { ventes: 0, commandes: 0, clients: new Set<string>() };
    entry.ventes += o.montantTotal;
    entry.commandes += 1;
    entry.clients.add(o.utilisateurId);
    monthly.set(key, entry);
  });
  const salesByMonth = Array.from(monthly.entries()).map(([mois, v]) => ({ mois, ventes: Math.round(v.ventes / 1000), commandes: v.commandes, clients: v.clients.size }));

  const catCount = new Map<string, number>();
  products.forEach((p) => catCount.set(p.categorie, (catCount.get(p.categorie) ?? 0) + 1));
  const categoryBreakdown = Array.from(catCount.entries()).map(([name, value]) => ({ name, value }));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => (
          <div key={s.l} className="rounded-2xl border border-border/60 bg-card p-5 shadow-inner/5">
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

      {!loading && orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-xs font-bold text-muted-foreground">
          Aucune vente pour le moment. Vos statistiques apparaitront ici des votre premiere commande.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
            <h2 className="mb-4 font-display text-sm font-black text-foreground">Evolution des ventes (K FCFA)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={salesByMonth}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="mois" stroke="var(--muted-foreground)" fontSize={11} fontStyle="bold" />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} fontStyle="bold" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 11 }} />
                <Area type="monotone" dataKey="ventes" stroke="#10B981" strokeWidth={3.5} fill="url(#grad1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
            <h2 className="mb-4 font-display text-sm font-black text-foreground">Produits par categorie</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryBreakdown} dataKey="value" nameKey="name" outerRadius={75} paddingAngle={3}>
                  {categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: "bold" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
          <h2 className="mb-4 font-display text-sm font-black text-foreground">Commandes vs. Nouveaux clients</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="mois" stroke="var(--muted-foreground)" fontSize={11} fontStyle="bold" />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} fontStyle="bold" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11, fontWeight: "bold" }} />
              <Bar dataKey="commandes" name="Commandes" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="clients" name="Nouveaux clients" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}

function SellerProducts({ vendeurId }: { vendeurId: string }) {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  const load = () => {
    setLoading(true);
    fetchProductsBySeller(vendeurId).then(setProducts).finally(() => setLoading(false));
  };

  useEffect(() => { load(); fetchCategoriesRaw().then(setCategories); }, [vendeurId]);

  const list = products.filter((p) => p.nom.toLowerCase().includes(q.toLowerCase()));

  const remove = async (p: Product) => {
    if (!confirm(`Supprimer "${p.nom}" ?`)) return;
    try {
      await deleteProduct(p.id);
      toast.success("Produit supprime avec succes");
      load();
    } catch {
      toast.error("Suppression impossible");
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-black text-foreground">Mes produits en vente</h2>
          <p className="text-xs font-medium text-muted-foreground">Pilotez votre inventaire et ajustez vos stocks.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un produit..."
              className="rounded-xl border border-border bg-background h-9 pl-9 pr-3 text-xs font-semibold outline-none transition focus:border-primary w-52"
            />
          </div>
          <button
            onClick={() => setAdding(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 h-9 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
          >
            <PlusCircle className="h-4 w-4 stroke-[2.2]" /> Ajouter un produit
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-xs font-semibold text-muted-foreground text-center py-8">Chargement...</p>
      ) : (
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left text-xs border-collapse min-w-[500px]">
            <thead>
              <tr className="text-muted-foreground/80 font-bold uppercase text-[10px] tracking-wider border-b border-border/40">
                <th className="pb-3">Produit</th>
                <th className="pb-3">Prix</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3">Note</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-semibold text-foreground/90">
              {list.map((p) => (
                <tr key={p.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-9 w-9 rounded-xl object-cover border bg-muted" />
                      <span className="font-bold text-foreground line-clamp-1 max-w-[220px]">{p.nom}</span>
                    </div>
                  </td>
                  <td className="py-3 font-black">{formatFCFA(p.prix)}</td>
                  <td className="py-3">
                    {p.stock <= 10 ? (
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 font-bold text-amber-600">{p.stock} (critique)</span>
                    ) : (
                      <span className="text-muted-foreground">{p.stock} unites</span>
                    )}
                  </td>
                  <td className="py-3 text-muted-foreground">{p.note.toFixed(1)} / 5</td>
                  <td className="py-3 text-right">
                    <button
                      className="mr-1.5 inline-grid h-8 w-8 place-items-center rounded-xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition shadow-2xs"
                      onClick={() => setEditing(p)}
                      title="Modifier"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="inline-grid h-8 w-8 place-items-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition shadow-2xs"
                      onClick={() => remove(p)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Aucun produit pour le moment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditProductModal
          product={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      {adding && (
        <AddProductModal
          vendeurId={vendeurId}
          onClose={() => setAdding(false)}
          onCreated={() => { setAdding(false); load(); }}
        />
      )}
    </div>
  );
}

function EditProductModal({ product, categories, onClose, onSaved }: { product: Product; categories: CategoryDto[]; onClose: () => void; onSaved: () => void }) {
  const [nom, setNom] = useState(product.nom);
  const [prix, setPrix] = useState(String(product.prix));
  const [stock, setStock] = useState(String(product.stock));
  const [description, setDescription] = useState(product.description);
  const [saving, setSaving] = useState(false);
  const categorieId = categories.find((c) => c.nom.toLowerCase() === product.categorie || c.nom.toLowerCase().startsWith(product.categorie.slice(0, 4)))?.id ?? categories[0]?.id ?? 1;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProduct(product.id, {
        nom, description, prix: Number(prix), stock: Number(stock), image: product.image,
        categorieId, marque: product.marque, ancienPrix: product.ancienPrix ?? null,
      });
      toast.success("Produit mis a jour");
      onSaved();
    } catch {
      toast.error("Mise a jour impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl space-y-4">
        <h3 className="font-display text-base font-black text-foreground">Modifier le produit</h3>
        <label className="block"><span className="mb-1 block text-xs font-bold text-muted-foreground">Nom</span>
          <input value={nom} onChange={(e) => setNom(e.target.value)} required className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold outline-none focus:border-primary" />
        </label>
        <label className="block"><span className="mb-1 block text-xs font-bold text-muted-foreground">Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:border-primary" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1 block text-xs font-bold text-muted-foreground">Prix (FCFA)</span>
            <input type="number" value={prix} onChange={(e) => setPrix(e.target.value)} required className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold outline-none focus:border-primary" />
          </label>
          <label className="block"><span className="mb-1 block text-xs font-bold text-muted-foreground">Stock</span>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold outline-none focus:border-primary" />
          </label>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-primary h-10 text-xs font-bold text-primary-foreground disabled:opacity-50">{saving ? "Enregistrement..." : "Enregistrer"}</button>
          <button type="button" onClick={onClose} className="rounded-xl border border-border bg-background h-10 px-4 text-xs font-bold text-foreground/80">Annuler</button>
        </div>
      </form>
    </div>
  );
}

function AddProductModal({ vendeurId, onClose, onCreated }: { vendeurId: string; onClose: () => void; onCreated: () => void }) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [stock, setStock] = useState("");
  const [categorieId, setCategorieId] = useState<number | null>(null);
  const [promotion, setPromotion] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategoriesRaw().then((list) => { setCategories(list); if (list[0]) setCategorieId(list[0].id); });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categorieId) return;
    setSaving(true);
    try {
      await createProduct({
        nom, description, prix: Number(prix), stock: Number(stock), categorieId,
        promotion: promotion ? Number(promotion) : 0,
        image: image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
      });
      toast.success("Felicitations, produit publie avec succes !");
      onCreated();
    } catch {
      toast.error("La publication du produit a echoue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 overflow-y-auto" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="my-8 w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-black text-foreground">Ajouter un nouveau produit</h2>
            <p className="text-xs font-medium text-muted-foreground">Remplissez le formulaire pour rendre votre article visible sur la marketplace.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground hover:text-foreground transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Nom complet de l'article</span>
            <input value={nom} onChange={(e) => setNom(e.target.value)} required className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold text-foreground outline-none transition focus:border-primary" />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Description detaillee</span>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="Decrivez les fonctionnalites, tailles, couleurs disponibles..."
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Prix de vente (FCFA)</span>
            <input type="number" required value={prix} onChange={(e) => setPrix(e.target.value)} className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold text-foreground outline-none transition focus:border-primary" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Quantite de stock initial</span>
            <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold text-foreground outline-none transition focus:border-primary" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Categorie cible</span>
            <select value={categorieId ?? ""} onChange={(e) => setCategorieId(Number(e.target.value))} className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold text-foreground outline-none transition focus:border-primary">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Taux de promotion (%)</span>
            <input type="number" value={promotion} onChange={(e) => setPromotion(e.target.value)} placeholder="0" min={0} max={99} className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold text-foreground outline-none transition focus:border-primary" />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-bold text-muted-foreground">URL de l'image</span>
            <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold text-foreground outline-none transition focus:border-primary" />
          </label>
        </div>

        <div className="flex gap-2 pt-5">
          <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-primary h-11 px-6 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shadow-sm disabled:opacity-50">
            {saving ? "Publication..." : "Mettre le produit en ligne"}
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border border-border bg-background h-11 px-4 text-xs font-bold text-foreground/80">Annuler</button>
        </div>
      </form>
    </div>
  );
}

function SellerOrdersView({ vendeurId }: { vendeurId: string }) {
  const [detail, setDetail] = useState<Order | null>(null);
  const [detailItems, setDetailItems] = useState<OrderDetail[]>([]);
  const [filter, setFilter] = useState<string>("toutes");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchOrdersForSeller(vendeurId).then(setOrders).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [vendeurId]);
  useEffect(() => {
    if (!detail) { setDetailItems([]); return; }
    fetchOrderDetails(detail.id).then(setDetailItems).catch(() => setDetailItems([]));
  }, [detail]);

  const list = orders.filter((o) => filter === "toutes" || o.statut === filter);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
      <div className="mb-5">
        <h2 className="font-display text-base font-black text-foreground">Commandes clients recues</h2>
        <p className="text-xs font-medium text-muted-foreground">Gerez l'avancement des livraisons et validez vos ventes.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["toutes", "EN_ATTENTE", "PAYEE", "EXPEDIEE", "LIVREE", "ANNULEE"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${filter === f ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground"}`}
          >
            {f === "toutes" ? "Toutes" : f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-xs font-semibold text-muted-foreground text-center py-8">Chargement...</p>
      ) : (
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="text-muted-foreground/80 font-bold uppercase text-[10px] tracking-wider border-b border-border/40">
                <th className="pb-3">Ref</th>
                <th className="pb-3">Client</th>
                <th className="pb-3">Total brut</th>
                <th className="pb-3">Mode paiement</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-semibold text-foreground/90">
              {list.map((o) => (
                <tr key={o.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 font-mono text-[11px] font-bold text-primary">#{o.id}</td>
                  <td className="py-3.5 font-bold text-foreground">{o.clientNom}</td>
                  <td className="py-3.5 font-black text-foreground">{formatFCFA(o.montantTotal)}</td>
                  <td className="py-3.5 text-muted-foreground text-[11px]">{o.modePaiement}</td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${orderStatusColor(o.statut)}`}>
                      {o.statut}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => setDetail(o)}
                      className="inline-flex items-center gap-1 rounded-xl bg-muted px-3 h-8 text-[11px] font-bold text-foreground/80 hover:bg-primary hover:text-primary-foreground transition shadow-2xs"
                    >
                      <Eye className="h-3 w-3 stroke-[2.2]" /> Gerer
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Aucune commande pour le moment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <OrderDetailModal
          order={detail}
          items={detailItems}
          onClose={() => setDetail(null)}
          canEdit
          onUpdated={() => load()}
        />
      )}
    </div>
  );
}

function ShopForm({ vendeurId }: { vendeurId: string }) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [nomBoutique, setNomBoutique] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSeller(vendeurId).then((s) => { setSeller(s); setNomBoutique(s.nomBoutique); setDescription(s.description ?? ""); });
  }, [vendeurId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller) return;
    setSaving(true);
    try {
      const updated = await updateShopProfile(seller, { nomBoutique, description, logo: seller.logo });
      setSeller(updated);
      toast.success("Fiche boutique mise a jour avec succes");
    } catch {
      toast.error("Mise a jour impossible");
    } finally {
      setSaving(false);
    }
  };

  if (!seller) return <div className="rounded-2xl border border-border/60 bg-card p-6 text-xs font-semibold text-muted-foreground">Chargement...</div>;

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
      <div className="mb-5">
        <h2 className="font-display text-lg font-black text-foreground">Identite de ma boutique</h2>
        <p className="text-xs font-medium text-muted-foreground">Configurez les informations visibles par le public senegalais.</p>
        <span className={`mt-2 inline-flex rounded-lg px-2 py-0.5 text-[10px] font-black uppercase ${seller.statut === "VALIDE" ? "bg-emerald-50 text-emerald-600" : seller.statut === "EN_ATTENTE" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}>
          {seller.statut === "VALIDE" ? "Boutique validee" : seller.statut === "EN_ATTENTE" ? "En attente de validation" : "Boutique bloquee"}
        </span>
      </div>

      <div className="mb-6 flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border/40 w-fit">
        <div className="grid h-16 w-16 place-items-center rounded-xl bg-primary/10 text-primary shadow-inner">
          <Store className="h-6 w-6" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Nom commercial de l'enseigne</span>
          <input value={nomBoutique} onChange={(e) => setNomBoutique(e.target.value)} required className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold text-foreground outline-none transition focus:border-primary" />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Presentation ou biographie d'entreprise</span>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </label>
      </div>

      <button type="submit" disabled={saving} className="mt-6 rounded-xl bg-primary h-11 px-6 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shadow-sm disabled:opacity-50">
        {saving ? "Enregistrement..." : "Sauvegarder les informations vitrine"}
      </button>
    </form>
  );
}
