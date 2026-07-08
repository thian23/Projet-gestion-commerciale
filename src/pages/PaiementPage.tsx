import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, X, ShieldCheck, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { CheckoutSteps, MiniHeader, OrderSummary } from "@/components/site/Checkout";
import { RoleGate } from "@/components/site/RoleWorkspace";
import { useCart, cartActions, cartTotal } from "@/lib/cart-store";
import { placeOrder, apiRegister } from "@/lib/api";
import { authActions, useUser } from "@/lib/auth-store";
import { formatFCFA } from "@/lib/mock-data";
import { PLATFORM_PHONE_DISPLAY, PLATFORM_PHONE_RAW } from "@/lib/tenant";
import type { CheckoutInfo } from "@/pages/ValidationPage";

const fintechs = [
  { id: "wave", nom: "Wave", desc: "Paiement instantane sans frais" },
  { id: "orange", nom: "Orange Money", desc: "Via code de paiement" },
  { id: "free", nom: "Free Money", desc: "Validation par code secret" },
  { id: "cod", nom: "Paiement a la livraison", desc: "Reglement en especes" },
] as const;

export function PaiementPage() {
  return (
    <RoleGate area="checkout">
      <PaiementContent />
    </RoleGate>
  );
}

function PaiementContent() {
  const cart = useCart();
  const user = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const info = (location.state as CheckoutInfo | null) ?? null;

  const [method, setMethod] = useState<string>("wave");
  const [phone, setPhone] = useState(PLATFORM_PHONE_RAW);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const selected = fintechs.find((m) => m.id === method)!;

  useEffect(() => { document.title = "Paiement securise | SenBazar"; }, []);

  const pay = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      let buyer = user;
      if (buyer.role === "visiteur") {
        if (!info?.nom || !info?.email) {
          toast.error("Merci de renseigner vos coordonnees a l'etape precedente.");
          navigate("/validation");
          return;
        }
        try {
          const guestPassword = `sb-${Math.random().toString(36).slice(2, 10)}`;
          buyer = await apiRegister(info.nom, info.email, guestPassword, "client");
          authActions.setUser(buyer);
        } catch {
          toast.error("Un compte existe deja avec cet email. Connectez-vous pour continuer votre commande.");
          navigate("/connexion?role=client");
          return;
        }
      }

      const order = await placeOrder({
        userId: buyer.id,
        items: cart.map((c) => ({ produitId: c.product.id, nom: c.product.nom, prix: c.product.prix, quantite: c.quantity })),
        total: cartTotal(cart),
        modePaiement: selected.nom,
        adresseLivraison: info?.adresse ? `${info.adresse}, ${info.ville}` : "Rue 12, Mermoz, Dakar",
        telephone: info?.telephone || phone || PLATFORM_PHONE_RAW,
        paye: method !== "cod",
      });
      setOrderId(order.id);
      cartActions.clear();
    } catch {
      toast.error("Le paiement n'a pas pu etre enregistre. Veuillez reessayer.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background antialiased font-sans">
      <MiniHeader />

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <div className="text-center">
          <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-primary">Reglement</div>
          <h1 className="font-display text-2xl font-black tracking-tight text-foreground md:text-3xl">Option de paiement</h1>
        </div>

        <CheckoutSteps active={3} />

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <h2 className="mb-1 font-display text-base font-black text-foreground">Choisissez votre moyen de paiement</h2>
              <p className="mb-6 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Options de chiffrement 100% securisees
              </p>

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-muted-foreground">Mode de paiement</span>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary"
                >
                  {fintechs.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
              </label>
              <p className="mt-2 text-[11px] font-medium text-muted-foreground">{selected.desc}</p>

              <div className="mt-8 rounded-2xl border border-border/40 bg-muted/30 p-6">
                {method !== "cod" ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-foreground">
                      Numero de compte {selected.nom} <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={PLATFORM_PHONE_RAW}
                        className="h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm font-semibold outline-none transition focus:border-primary"
                      />
                      <button
                        onClick={pay}
                        disabled={processing || cart.length === 0 || !phone}
                        className="flex h-11 items-center justify-center gap-1 rounded-xl bg-primary px-6 text-xs font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 disabled:opacity-50"
                      >
                        {processing ? "Traitement..." : `Valider ${formatFCFA(cartTotal(cart))}`}
                        {!processing && <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />}
                      </button>
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground">
                      Une demande Push PIN sera envoyee sur ce telephone pour valider le paiement.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold text-foreground">Reglement a la livraison</p>
                      <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">Preparez le montant exact au passage du livreur.</p>
                    </div>
                    <button
                      onClick={pay}
                      disabled={processing || cart.length === 0}
                      className="h-11 whitespace-nowrap rounded-xl bg-primary px-6 text-xs font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 disabled:opacity-50"
                    >
                      {processing ? "Confirmation..." : "Confirmer ma commande"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-muted/10 p-4 text-xs font-medium text-muted-foreground">
              <div>
                <span className="mb-0.5 block font-bold text-foreground">Livraison</span>
                {info?.nom || user.nom} - {info?.adresse ? `${info.adresse}, ${info.ville}` : "Rue 12, Mermoz, Dakar"} - {PLATFORM_PHONE_DISPLAY}
              </div>
              <Link to="/validation" className="shrink-0 text-[11px] font-bold text-primary hover:underline">Modifier</Link>
            </div>
          </section>

          <OrderSummary items={cart} />
        </div>
      </main>

      {orderId && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200">
          <div className="relative w-full max-w-sm animate-in zoom-in-95 rounded-3xl border border-border/40 bg-card p-8 text-center shadow-2xl duration-200">
            <button onClick={() => navigate("/")} className="absolute right-4 top-4 p-1 text-muted-foreground transition hover:text-foreground" aria-label="Fermer">
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
              <CheckCircle2 className="h-9 w-9 stroke-[2]" />
            </div>
            <h2 className="font-display text-2xl font-black tracking-tight text-foreground">Paiement effectue</h2>
            <p className="mt-2 text-xs font-medium text-muted-foreground">Votre commande a ete enregistree avec succes.</p>
            <div className="mt-5 rounded-xl border border-border/20 bg-muted px-4 py-2.5 font-mono text-xs font-bold text-foreground">
              Reference : <span className="text-primary">#{orderId}</span>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Link to="/compte" className="flex h-11 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/95">Suivre mes achats</Link>
              <Link to="/" className="flex h-11 items-center justify-center rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground transition hover:text-foreground">Retour a l accueil</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
