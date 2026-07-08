import { Link } from "react-router-dom";
import { Check } from "lucide-react";

export function CheckoutSteps({ active }: { active: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Panier" },
    { n: 2, label: "Validation" },
    { n: 3, label: "Paiement" },
  ];
  return (
    <div className="mb-8 flex items-center justify-center gap-2 md:gap-4">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <div className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${s.n < active ? "bg-primary text-primary-foreground" : s.n === active ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"}`}>
              {s.n < active ? <Check className="h-4 w-4" /> : s.n}
            </div>
            <span className={`hidden sm:inline text-sm font-medium ${s.n <= active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className={`h-0.5 w-8 md:w-16 ${s.n < active ? "bg-primary" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

export function MiniHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-display font-bold">S</div>
          <span className="font-display text-xl font-bold">Sen<span className="text-primary">Bazar</span></span>
        </Link>
        <Link to="/panier" className="text-sm text-muted-foreground hover:text-foreground">Retour au panier</Link>
      </div>
    </header>
  );
}

export function OrderSummary({ items, livraison = 0, taxesRate = 0.05 }: { items: { product: { prix: number; nom: string; image: string }; quantity: number }[]; livraison?: number; taxesRate?: number }) {
  const subtotal = items.reduce((s, i) => s + i.product.prix * i.quantity, 0);
  const taxes = Math.round(subtotal * taxesRate);
  const total = subtotal + livraison + taxes;
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
  return (
    <aside className="rounded-2xl border border-border bg-card p-5 h-fit sticky top-6">
      <h3 className="mb-4 font-display text-lg font-bold">Votre commande</h3>
      <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
        {items.map((i, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <img src={i.product.image} alt="" className="aspect-square w-12 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <div className="line-clamp-1 text-sm font-medium">{i.product.nom}</div>
              <div className="text-xs text-muted-foreground">Qte : {i.quantity}</div>
            </div>
            <div className="text-sm font-medium">{fmt(i.product.prix * i.quantity)}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{fmt(subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Livraison</span><span>{livraison ? fmt(livraison) : "Gratuite"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Taxes</span><span>{fmt(taxes)}</span></div>
        <div className="flex justify-between border-t border-border pt-2 font-display text-base font-bold"><span>Total</span><span className="text-primary">{fmt(total)}</span></div>
      </div>
    </aside>
  );
}
