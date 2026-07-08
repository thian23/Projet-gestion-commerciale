import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Heart, User, LogOut, Award, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { OrderDetailModal } from "@/components/site/OrderDetailModal";
import { formatFCFA, salesData, type Product } from "@/lib/mock-data";
import { useFavorites } from "@/lib/cart-store";
import { useUser } from "@/lib/auth-store";
import { fetchOrderDetails, fetchOrdersForUser, fetchProducts, orderStatusColor, type Order, type OrderDetail, type OrderStatus } from "@/lib/api";

type Tab = "dashboard" | "commandes" | "favoris" | "profil";

const CHART_COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899", "#64748B"];

export function ComptePage() {
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role === "visiteur") navigate("/connexion");
  }, [user.role, navigate]);

  const [tab, setTab] = useState<Tab>("dashboard");
  const [orderFilter, setOrderFilter] = useState<"toutes" | OrderStatus>("toutes");
  const [showPwd, setShowPwd] = useState(false);
  const [detail, setDetail] = useState<Order | null>(null);
  const [detailItems, setDetailItems] = useState<OrderDetail[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const favs = useFavorites();

  useEffect(() => {
    document.title = "Mon compte | SenBazar";
    fetchProducts().then(setAllProducts);
  }, []);

  useEffect(() => {
    if (user.role === "visiteur") return;
    fetchOrdersForUser(user.id).then(setOrders).catch(() => setOrders([]));
  }, [user.id, user.role]);

  useEffect(() => {
    if (!detail) { setDetailItems([]); return; }
    fetchOrderDetails(detail.id).then(setDetailItems).catch(() => setDetailItems([]));
  }, [detail]);

  if (user.role === "visiteur") return null;

  const filtered = orders.filter((o) => orderFilter === "toutes" || o.statut === orderFilter);
  const favProducts = allProducts.filter((p) => favs.has(p.id));

  const spentByMonth = salesData.map((s) => ({ mois: s.mois, depense: Math.round(s.ventes * 250) }));
  const categorySpend = [
    { name: "Vetements", value: 45000 },
    { name: "Beaute", value: 21000 },
    { name: "Electronique", value: 135000 },
    { name: "Accessoires", value: 27500 },
  ];

  const nav: { id: Tab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "commandes", label: "Mes commandes", icon: Package },
    { id: "favoris", label: "Mes favoris", icon: Heart },
    { id: "profil", label: "Mon profil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background antialiased">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-border/60 bg-card p-4 h-fit md:sticky md:top-28 shadow-sm">
            <div className="mb-4 flex items-center gap-3 border-b border-border/40 pb-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary font-display text-sm font-black text-primary-foreground shadow-md">
                {user.avatarLetter}
              </div>
              <div className="min-w-0">
                <div className="font-display font-black text-sm text-foreground truncate">{user.nom}</div>
                <div className="text-[10px] bg-muted inline-block px-1.5 py-0.5 rounded-md font-bold text-muted-foreground capitalize mt-0.5">{user.role}</div>
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

          <section className="min-w-0">
            {tab === "dashboard" && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-gradient-to-br from-primary via-emerald-500 to-emerald-600 p-6 text-primary-foreground shadow-xl shadow-primary/10">
                  <h1 className="font-display text-2xl font-black tracking-tight">Bonjour, {user.nom.split(" ")[0]} !</h1>
                  <p className="mt-1 text-xs font-medium opacity-90">Bienvenue dans votre espace personnel SenBazar. Suivez vos commandes en un coup d'oeil.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard icon={Award} label="Points de fidelite" value="1 240 pts" sub="Equivaut a 12 400 FCFA" />
                  <StatCard icon={Package} label="Commandes passees" value={String(orders.length)} sub="Toutes periodes confondues" />
                  <StatCard icon={Heart} label="Liste de favoris" value={String(favs.size)} sub="Produits sauvegardes" />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                  <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
                    <h2 className="mb-4 font-display text-sm font-black text-foreground">Suivi de mes depenses (FCFA)</h2>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={spentByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                        <XAxis dataKey="mois" stroke="var(--muted-foreground)" fontSize={11} fontStyle="bold" />
                        <YAxis stroke="var(--muted-foreground)" fontSize={11} fontStyle="bold" />
                        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 11 }} />
                        <Line type="monotone" dataKey="depense" stroke="#10B981" strokeWidth={3.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
                    <h2 className="mb-4 font-display text-sm font-black text-foreground">Repartition par categorie</h2>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={categorySpend} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                          {categorySpend.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 11 }} formatter={(v: number) => formatFCFA(v)} />
                        <Legend wrapperStyle={{ fontSize: 11, fontWeight: "bold" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs">
                  <h2 className="mb-4 font-display text-sm font-black text-foreground">Dernieres commandes recentes</h2>
                  <OrdersTable orders={orders.slice(0, 3)} onView={setDetail} />
                </div>
              </div>
            )}

            {tab === "commandes" && (
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="mb-5">
                  <h2 className="font-display text-lg font-black text-foreground">Historique des commandes</h2>
                  <p className="text-xs font-medium text-muted-foreground">Consultez et suivez l'etat de toutes vos commandes sur SenBazar.</p>
                </div>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {(["toutes", "EN_ATTENTE", "PAYEE", "EXPEDIEE", "LIVREE", "ANNULEE"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${orderFilter === f ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground"}`}
                    >
                      {f === "toutes" ? "Toutes" : f}
                    </button>
                  ))}
                </div>
                <OrdersTable orders={filtered} onView={setDetail} />
              </div>
            )}

            {tab === "favoris" && (
              <div>
                <div className="mb-5">
                  <h2 className="font-display text-lg font-black text-foreground">Mes produits favoris ({favProducts.length})</h2>
                  <p className="text-xs font-medium text-muted-foreground">Retrouvez les articles que vous avez sauvegardes pour plus tard.</p>
                </div>
                {favProducts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center flex flex-col items-center gap-2">
                    <Heart className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-xs font-bold text-muted-foreground">
                      Aucun favori enregistre. Ajoutez des produits via l'icone coeur depuis le{" "}
                      <Link to="/catalogue" className="text-primary hover:underline">catalogue</Link>.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {favProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </div>
            )}

            {tab === "profil" && (
              <form onSubmit={(e) => { e.preventDefault(); toast.success("Profil mis a jour avec succes"); }} className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="mb-5">
                  <h2 className="font-display text-lg font-black text-foreground">Informations du profil</h2>
                  <p className="text-xs font-medium text-muted-foreground">Gerez vos coordonnees de livraison et vos parametres de securite.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nom complet" defaultValue={user.nom} required />
                  <Field label="Adresse email" type="email" defaultValue={user.email} required />
                  <Field label="Numero de telephone" defaultValue="+221 77 290 14 90" required />
                  <Field label="Adresse residentielle principale" className="sm:col-span-2" defaultValue="Rue 12, Mermoz, Dakar" required />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="submit" className="rounded-xl bg-primary h-10 px-5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shadow-sm">
                    Enregistrer les modifications
                  </button>
                  <button type="button" onClick={() => setShowPwd(true)} className="rounded-xl border border-border bg-background h-10 px-5 text-xs font-bold text-foreground/80 hover:bg-muted transition">
                    Changer de mot de passe
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>

      {showPwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowPwd(false)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-10">
            <button onClick={() => setShowPwd(false)} className="absolute right-4 top-4 rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition">
              <X className="h-4 w-4" />
            </button>
            <h3 className="mb-4 font-display text-base font-black text-foreground">Changer de mot de passe</h3>
            <form onSubmit={(e) => { e.preventDefault(); setShowPwd(false); toast.success("Mot de passe mis a jour"); }} className="space-y-4">
              <Field label="Mot de passe actuel" type="password" required />
              <Field label="Nouveau mot de passe" type="password" required />
              <Field label="Confirmer le nouveau mot de passe" type="password" required />
              <button type="submit" className="w-full rounded-xl bg-primary h-10 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shadow-sm mt-2">
                Valider le nouveau mot de passe
              </button>
            </form>
          </div>
        </div>
      )}

      {detail && <OrderDetailModal order={detail} items={detailItems} onClose={() => setDetail(null)} canEdit={false} />}

      <Footer />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-inner/5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground">{label}</span>
        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
          <Icon className="h-4 w-4 stroke-[2]" />
        </div>
      </div>
      <div className="mt-3 font-display text-xl font-black text-foreground tracking-tight">{value}</div>
      <div className="text-[10px] font-medium text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function OrdersTable({ orders, onView }: { orders: Order[]; onView: (o: Order) => void }) {
  if (orders.length === 0) return <p className="text-xs font-bold text-muted-foreground text-center py-8">Aucune commande enregistree pour le moment.</p>;

  return (
    <div className="overflow-x-auto scrollbar-none">
      <table className="w-full text-left text-xs border-collapse min-w-[500px]">
        <thead>
          <tr className="text-muted-foreground/80 font-bold uppercase text-[10px] tracking-wider border-b border-border/40">
            <th className="pb-3 font-black">Ref</th>
            <th className="pb-3">Date</th>
            <th className="pb-3">Total</th>
            <th className="pb-3">Statut</th>
            <th className="pb-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="font-semibold text-foreground/90">
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
              <td className="py-3.5 font-mono text-[11px] font-bold text-primary">#{o.id}</td>
              <td className="py-3.5 text-muted-foreground">{new Date(o.date).toLocaleDateString("fr-FR")}</td>
              <td className="py-3.5 font-black text-foreground">{formatFCFA(o.montantTotal)}</td>
              <td className="py-3.5">
                <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${orderStatusColor(o.statut)}`}>
                  {o.statut}
                </span>
              </td>
              <td className="py-3.5 text-right">
                <button
                  onClick={() => onView(o)}
                  className="inline-flex items-center gap-1 rounded-xl bg-muted px-3 h-8 text-[11px] font-bold text-foreground/80 hover:bg-primary hover:text-primary-foreground transition shadow-2xs"
                >
                  <Eye className="h-3 w-3 stroke-[2.2]" /> Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, className, ...props }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs font-bold text-muted-foreground">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-border bg-background h-10 px-3 text-xs font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </label>
  );
}
