import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Zap, ChevronRight } from "lucide-react";
import { CheckoutSteps, MiniHeader, OrderSummary } from "@/components/site/Checkout";
import { useCart } from "@/lib/cart-store";
import { useUser } from "@/lib/auth-store";

export type CheckoutInfo = {
  nom: string;
  email: string;
  telephone: string;
  ville: string;
  adresse: string;
  livraison: "standard" | "express";
};

export function ValidationPage() {
  const cart = useCart();
  const user = useUser();
  const navigate = useNavigate();
  const [livraison, setLivraison] = useState<"standard" | "express">("standard");
  const livraisonPrix = livraison === "express" ? 5000 : 0;

  const [nom, setNom] = useState(user.nom !== "Visiteur" ? user.nom : "");
  const [email, setEmail] = useState(user.email || "");
  const [telephone, setTelephone] = useState("+221 77 290 14 90");
  const [ville, setVille] = useState("Dakar");
  const [adresse, setAdresse] = useState("");

  useEffect(() => { document.title = "Validation de la commande | SenBazar"; }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const info: CheckoutInfo = { nom, email, telephone, ville, adresse, livraison };
    navigate("/paiement", { state: info });
  };

  return (
    <div className="min-h-screen bg-background antialiased font-sans">
      <MiniHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <div className="text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Etape finale</div>
          <h1 className="font-display text-2xl font-black tracking-tight md:text-3xl text-foreground">Validation de commande</h1>
        </div>

        <CheckoutSteps active={2} />

        <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start">
          <form onSubmit={submit} className="space-y-6">
            <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs">
              <h2 className="mb-4 font-display text-sm font-black text-foreground uppercase tracking-wider">Adresse de livraison</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom complet" required value={nom} onChange={(e) => setNom(e.target.value)} />
                <Field label="Adresse email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                <Field label="Telephone" type="tel" required value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                <Field label="Ville" required value={ville} onChange={(e) => setVille(e.target.value)} />
                <Field label="Adresse exacte" required className="sm:col-span-2" value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Rue 12, Mermoz" />
                <Field label="Code postal" defaultValue="12500" />
              </div>
            </section>

            <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs">
              <h2 className="mb-4 font-display text-sm font-black text-foreground uppercase tracking-wider">Mode de livraison</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "standard" as const, icon: Truck, t: "Livraison standard", d: "24h ouvrees partout", p: "Gratuite" },
                  { id: "express" as const, icon: Zap, t: "Livraison express", d: "Sous 2h (Dakar uniquement)", p: "5 000 FCFA" },
                ].map((o) => {
                  const Icon = o.icon;
                  const isSelected = livraison === o.id;
                  return (
                    <label
                      key={o.id}
                      className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border-2 p-4 transition-all ${isSelected ? "border-primary bg-primary/5 shadow-2xs" : "border-border/60 hover:border-primary/40 bg-card"}`}
                    >
                      <input
                        type="radio"
                        name="liv"
                        checked={isSelected}
                        onChange={() => setLivraison(o.id)}
                        className="sr-only"
                      />
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${isSelected ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="h-5 w-5 stroke-[2]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-foreground leading-snug">{o.t}</div>
                        <div className="text-[11px] text-muted-foreground font-medium mt-0.5">{o.d}</div>
                      </div>
                      <div className="text-xs font-black text-primary whitespace-nowrap">{o.p}</div>
                    </label>
                  );
                })}
              </div>
            </section>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary h-12 px-6 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 active:scale-98"
            >
              Continuer vers le paiement <ChevronRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </form>

          <OrderSummary items={cart} livraison={livraisonPrix} />
        </div>
      </main>
    </div>
  );
}

function Field({ label, className, ...props }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs font-bold text-muted-foreground/80">
        {label}{props.required && <span className="text-rose-500 ml-0.5">*</span>}
      </span>
      <input
        {...props}
        className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </label>
  );
}
