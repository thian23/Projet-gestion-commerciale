import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowRight, Tag, ShoppingCart, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCart, cartActions, cartTotal } from "@/lib/cart-store";
import { formatFCFA } from "@/lib/mock-data";

const cartStyles = `
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-cart-load {
    animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .bazar-card {
    background: var(--card, #ffffff);
    border: 1px solid rgba(var(--border), 0.12);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.01), 0 12px 28px rgba(0, 0, 0, 0.02);
  }
`;

export function PanierPage() {
  const cart = useCart();
  const subtotal = cartTotal(cart);

  const livraison = subtotal > 50000 || subtotal === 0 ? 0 : 2500;
  const taxes = Math.round(subtotal * 0.05);

  const [promo, setPromo] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);

  const total = subtotal + livraison + taxes - discount;

  useEffect(() => { document.title = "Mon panier | SenBazar"; }, []);

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "SEN10") {
      setDiscount(Math.round(subtotal * 0.1));
      toast.success("Code SEN10 applique avec succes : -10%");
    } else {
      toast.error("Code promo invalide ou expire");
    }
  };

  return (
    <div className="min-h-screen bg-background antialiased font-sans overflow-x-hidden">
      <style>{cartStyles}</style>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 animate-cart-load space-y-8 relative z-10">
        <div className="flex items-center justify-between border-b border-border/40 pb-5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Votre selection</div>
            <h1 className="font-display text-2xl font-black tracking-tight md:text-4xl text-foreground">Mon Panier</h1>
          </div>
          <Link to="/catalogue" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition group">
            <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Continuer mes achats
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-16 text-center shadow-inner flex flex-col items-center justify-center space-y-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted/60 text-muted-foreground">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-muted-foreground">Votre panier est actuellement vide.</p>
              <p className="text-xs text-muted-foreground/60 max-w-xs">Decouvrez des milliers de produits locaux et internationaux de confiance sur SenBazar.</p>
            </div>
            <Link to="/catalogue" className="rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 active:scale-98">
              Decouvrir le catalogue
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px] items-start">
            <div className="rounded-3xl bazar-card overflow-hidden">
              <div className="hidden md:grid grid-cols-[80px_1fr_120px_140px_100px_40px] gap-6 border-b border-border/60 bg-muted/30 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Visuel</span><span>Produit</span><span>Prix Unitaire</span><span>Quantite</span><span className="text-right">Total HT</span><span></span>
              </div>

              {cart.map((item) => (
                <div key={item.product.id} className="grid grid-cols-[80px_1fr] md:grid-cols-[80px_1fr_120px_140px_100px_40px] items-center gap-4 md:gap-6 border-b border-border/40 p-4 md:px-6 md:py-5 last:border-b-0 group hover:bg-muted/10 transition-colors">
                  <Link to={`/produit/${item.product.id}`} className="block overflow-hidden rounded-xl border border-border bg-card">
                    <img src={item.product.image} alt={item.product.nom} className="aspect-square w-20 rounded-lg object-cover transition-transform group-hover:scale-105 duration-300" />
                  </Link>

                  <div className="min-w-0 pr-4">
                    <Link to={`/produit/${item.product.id}`} className="line-clamp-2 text-xs font-bold text-foreground hover:text-primary leading-snug">{item.product.nom}</Link>
                    <div className="text-[10px] font-medium text-muted-foreground mt-0.5">{item.product.vendeur}</div>

                    <div className="text-xs font-black text-foreground mt-2 md:hidden">{formatFCFA(item.product.prix)}</div>
                  </div>

                  <div className="hidden md:block text-xs font-bold text-foreground">{formatFCFA(item.product.prix)}</div>

                  <div className="flex items-center rounded-xl border border-border bg-card h-9 shadow-inner transition group-focus-within:border-primary">
                    <button onClick={() => cartActions.setQty(item.product.id, item.quantity - 1)} className="grid h-full w-9 place-items-center text-muted-foreground hover:text-foreground transition disabled:opacity-40" aria-label="Diminuer" disabled={item.quantity <= 1}><Minus className="h-3 w-3 stroke-[2.5]" /></button>
                    <span className="w-8 text-center text-xs font-black text-foreground">{item.quantity}</span>
                    <button onClick={() => cartActions.setQty(item.product.id, item.quantity + 1)} className="grid h-full w-9 place-items-center text-muted-foreground hover:text-foreground transition"><Plus className="h-3 w-3 stroke-[2.5]" /></button>
                  </div>

                  <div className="hidden md:block text-right font-black text-sm text-primary">{formatFCFA(item.product.prix * item.quantity)}</div>

                  <button onClick={() => cartActions.remove(item.product.id)} aria-label="Supprimer cet article" className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground/60 hover:bg-rose-50 hover:text-rose-600 justify-self-end -mr-2 transition"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>

            <aside className="rounded-3xl bazar-card p-6 h-fit sticky top-28 space-y-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Resume</div>
                <h2 className="font-display text-xl font-black tracking-tight text-foreground">Recapitulatif</h2>
              </div>

              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Sous-total HT</span><span className="text-foreground font-bold">{formatFCFA(subtotal)}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Frais de livraison</span><span className={`font-bold ${livraison === 0 ? "text-emerald-600" : "text-foreground"}`}>{livraison === 0 ? "Gratuite" : formatFCFA(livraison)}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Taxes simulees (5%)</span><span className="text-foreground font-bold">{formatFCFA(taxes)}</span></div>

                {discount > 0 && <div className="flex justify-between items-center text-rose-600 rounded-lg bg-rose-50 px-3 py-1.5 -mx-1 border border-rose-100/60 font-bold"><span>Reduction immediate</span><span>-{formatFCFA(discount)}</span></div>}

                <div className="my-4 border-t border-border/60 pt-4" />

                <div className="flex justify-between items-center font-display text-xl font-black text-foreground"><span>Total TTC</span><span className="text-primary tracking-tight">{formatFCFA(total)}</span></div>
              </div>

              <div className="mt-5 flex gap-2 overflow-hidden">
                <div className="relative flex-1">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                  <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Code promo (ex: SEN10)" className="w-full h-10 rounded-xl border border-border bg-background px-3 pl-10 text-xs font-semibold placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" />
                </div>
                <button onClick={applyPromo} className="h-10 rounded-xl border border-border bg-card px-4 text-xs font-bold hover:bg-muted active:scale-95 transition">Appliquer</button>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium pl-3">Conseil : Essayez <span className="font-bold text-primary">SEN10</span> pour une reduction de <span className="font-black">10%</span></p>

              <div className="pt-2 space-y-3">
                <Link to="/validation" className="flex items-center justify-center gap-2 rounded-xl bg-primary h-12 px-7 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 active:scale-98">
                  Passer la commande securisee <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/catalogue" className="block text-center rounded-xl bg-muted/60 hover:bg-muted px-5 py-3 text-[11px] font-bold text-muted-foreground hover:text-foreground transition active:scale-98">
                  Poursuivre mon shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
