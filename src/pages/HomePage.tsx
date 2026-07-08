import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, featured as fallbackFeatured, promos as fallbackPromos, type Product } from "@/lib/mock-data";
import { fetchProducts, fetchSellers } from "@/lib/api";

const premiumStyles = `
  @keyframes cubicFadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes softPulse {
    0%, 100% { transform: scale(1); opacity: 0.15; }
    50% { transform: scale(1.05); opacity: 0.25; }
  }
  .animate-fade-in-up {
    animation: cubicFadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .animate-pulse-soft {
    animation: softPulse 8s ease-in-out infinite;
  }
  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }

  .bazar-card {
    background: var(--card, #ffffff);
    border: 1px solid rgba(var(--border), 0.12);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.01), 0 12px 28px rgba(0, 0, 0, 0.02);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .bazar-card:hover {
    transform: translateY(-6px) scale(1.01);
    border-color: var(--primary);
    box-shadow: 0 24px 38px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.01);
  }
`;

export function HomePage() {
  const [items, setItems] = useState<Product[]>([]);
  const [sellerCount, setSellerCount] = useState<number | null>(null);

  useEffect(() => {
    document.title = "SenBazar | La Marketplace du Sénégal";
    fetchProducts().then(setItems);
    fetchSellers().then((sellers) => setSellerCount(sellers.length)).catch(() => setSellerCount(null));
  }, []);

  const featured = useMemo(() => (items.length ? items.slice(0, 8) : fallbackFeatured), [items]);
  const promos = useMemo(() => (items.length ? items.filter((p) => p.promotion).slice(0, 8) : fallbackPromos), [items]);
  const productCount = items.length || fallbackFeatured.length;

  const testimonials = [
    {
      name: "Fatou Diop",
      role: "Acheteuse vérifiée (Dakar)",
      initials: "FD",
      rating: 5,
      comment: "Commande reçue en moins de 24h à Mermoz ! Le paiement par Wave est hyper fluide et le service client m'a appelée pour confirmer l'heure exacte de livraison. Je recommande SenBazar à 100%.",
    },
    {
      name: "Moustapha Ndiaye",
      role: "Boutique Électro-Plus (Vendeur)",
      initials: "MN",
      rating: 5,
      comment: "En tant que commerçant à Sandaga, SenBazar a donné une visibilité nationale à mes produits. La gestion des stocks est simple et les versements d'argent sont instantanés.",
    },
    {
      name: "Mariama Sane",
      role: "Acheteuse vérifiée (Thiès)",
      initials: "MS",
      rating: 4,
      comment: "Très bonne expérience pour l'achat de produits cosmétiques. La qualité est conforme aux photos et la livraison à Thiès s'est faite sans aucun problème. Un vrai soulagement !",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans antialiased overflow-x-hidden">
      <style>{premiumStyles}</style>
      <Header />

      <main className="space-y-4">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 md:py-28">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-secondary/15 blur-3xl animate-pulse-soft" />
          <div className="absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl animate-pulse-soft" style={{ animationDelay: "2s" }} />

          <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2 items-center relative z-10">
            <div className="flex flex-col justify-center space-y-6 opacity-0 animate-fade-in-up">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary w-fit shadow-sm">
                <Icons.Sparkles className="h-3.5 w-3.5 text-primary animate-bounce" />
                La marketplace du Sénégal
              </span>

              <h1 className="font-display text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl leading-[1.1]">
                Bienvenue sur <span className="text-primary relative inline-block">SenBazar</span>
              </h1>

              <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg font-medium">
                Achetez et vendez en ligne en toute simplicité au Sénégal. Découvrez des milliers d'articles locaux et internationaux.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/catalogue" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/95 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                  Découvrir le catalogue
                </Link>
                <Link to="/inscription?role=vendeur" className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-7 text-sm font-bold text-foreground shadow-sm transition-all duration-300 hover:bg-muted hover:-translate-y-0.5 active:translate-y-0">
                  Devenir vendeur
                </Link>
              </div>

              {/* Badges de confiance */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
                  <Icons.Truck className="h-3.5 w-3.5 text-primary" /> Livraison rapide
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
                  <Icons.ShieldCheck className="h-3.5 w-3.5 text-primary" /> Paiement sécurisé
                </div>
              </div>

              {/* Compteurs KPI (bases sur les vraies donnees du catalogue) */}
              <div className="grid grid-cols-3 gap-4 border-t border-border/60 pt-8 max-w-sm">
                <div className="transition-transform duration-300 hover:scale-105">
                  <span className="font-display text-2xl font-black text-foreground tracking-tight">{productCount}+</span>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Produits</p>
                </div>
                <div className="transition-transform duration-300 hover:scale-105">
                  <span className="font-display text-2xl font-black text-foreground tracking-tight">{sellerCount ?? "..."}</span>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Vendeurs</p>
                </div>
                <div className="transition-transform duration-300 hover:scale-105">
                  <span className="font-display text-2xl font-black text-foreground tracking-tight">8</span>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Catégories</p>
                </div>
              </div>
            </div>

            {/* Images Mosaïque */}
            <div className="relative hidden md:block opacity-0 animate-fade-in-up delay-100">
              <div className="relative grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="overflow-hidden rounded-2xl shadow-xl border border-border/20 transition-all duration-500 hover:scale-[1.03] hover:rotate-1">
                  <img src={featured[0]?.image} alt="" className="aspect-[3/4] w-full object-cover" loading="eager" />
                </div>
                <div className="mt-12 overflow-hidden rounded-2xl shadow-xl border border-border/20 transition-all duration-500 hover:scale-[1.03] hover:-rotate-1">
                  <img src={featured[1]?.image} alt="" className="aspect-[3/4] w-full object-cover" loading="eager" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Catégories populaires */}
        <section className="mx-auto max-w-7xl px-4 py-16 opacity-0 animate-fade-in-up delay-100">
          <div className="mb-8 flex items-end justify-between border-b border-border/40 pb-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Explorer</div>
              <h2 className="font-display text-2xl font-black tracking-tight md:text-3xl">Catégories populaires</h2>
            </div>
            <Link to="/catalogue" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all group">
              Voir tout <Icons.ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((c) => {
              const Icon = (Icons as any)[c.icon] ?? Icons.Tag;
              return (
                <Link key={c.slug} to={`/catalogue?cat=${c.slug}`} className="bazar-card group flex flex-col items-center gap-3 rounded-2xl p-4 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold leading-tight text-foreground transition-colors group-hover:text-primary">{c.nom}</span>
                    <span className="block text-[10px] font-medium text-muted-foreground">{c.count} articles</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Produits en vedette */}
        <section className="mx-auto max-w-7xl px-4 py-10 opacity-0 animate-fade-in-up delay-200">
          <div className="mb-8 flex items-end justify-between border-b border-border/40 pb-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Sélection</div>
              <h2 className="font-display text-2xl font-black tracking-tight md:text-3xl">Produits en vedette</h2>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">Notre coup de cœur du moment</p>
            </div>
            <Link to="/catalogue" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all group">
              Voir tout <Icons.ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* Offres spéciales (Promos) */}
        <section className="mx-auto max-w-7xl px-4 py-10 opacity-0 animate-fade-in-up delay-300">
          <div className="mb-8 flex items-end justify-between border-b border-border/40 pb-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">Bons Plans</div>
              <h2 className="font-display text-2xl font-black tracking-tight md:text-3xl flex items-center gap-2">
                <Icons.Flame className="h-6 w-6 text-rose-500 animate-pulse" /> Offres spéciales
              </h2>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">Économisez gros, durée limitée</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {promos.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* Avis Clients & Témoignages */}
        <section className="mx-auto max-w-7xl px-4 py-16 opacity-0 animate-fade-in-up delay-300">
          <div className="mb-10 text-center space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-primary">Confiance & Transparence</div>
            <h2 className="font-display text-2xl font-black tracking-tight md:text-4xl text-foreground">
              Ils font confiance à SenBazar
            </h2>
            <p className="text-xs md:text-sm font-medium text-muted-foreground max-w-md mx-auto">
              Découvrez les retours d'expérience de notre communauté d'acheteurs et de vendeurs à travers le pays.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, index) => (
              <div
                key={index}
                className="bazar-card rounded-2xl p-6 bg-card flex flex-col justify-between space-y-6 relative overflow-hidden group border border-border/40"
              >
                <Icons.Quote className="absolute right-4 bottom-4 h-14 w-14 text-muted/5 pointer-events-none transform group-hover:scale-110 transition-transform duration-300" />

                <div className="space-y-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Icons.Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    "{t.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-border/40 pt-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-foreground">{t.name}</h4>
                    <p className="text-[10px] font-semibold text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
