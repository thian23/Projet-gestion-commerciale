import { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router-dom";
import { Heart, Star, Minus, Plus, ShoppingCart, Zap, Store, MessageCircle, Truck, Shield, RotateCcw, CheckCircle, ChevronRight, X, Phone } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { formatFCFA, categories, type Product } from "@/lib/mock-data";
import { fetchProduct, fetchProducts } from "@/lib/api";
import { cartActions, useFavorites } from "@/lib/cart-store";

export async function productLoader({ params }: LoaderFunctionArgs) {
  const product = await fetchProduct(params.id!);
  if (!product) throw new Response("Produit introuvable", { status: 404 });
  const products = await fetchProducts();
  return { product, products };
}

export function ProductNotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center bg-background text-center px-4">
      <div className="space-y-3">
        <p className="text-sm font-bold text-muted-foreground">Oups !</p>
        <h1 className="text-xl font-black">Ce produit est introuvable ou n'existe plus.</h1>
        <Link to="/catalogue" className="inline-block rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground">
          Retourner au catalogue
        </Link>
      </div>
    </div>
  );
}

export function ProductPage() {
  const { product, products } = useLoaderData() as { product: Product; products: Product[] };
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "specs" | "avis">("desc");
  const [mainImage, setMainImage] = useState(product.image);
  const [contactOpen, setContactOpen] = useState(false);

  const navigate = useNavigate();
  const favs = useFavorites();
  const isFav = favs.has(product.id);
  const cat = categories.find((c) => c.slug === product.categorie);
  const similar = products.filter((p) => p.categorie === product.categorie && p.id !== product.id).slice(0, 4);

  useEffect(() => {
    document.title = `${product.nom} | SenBazar`;
    setMainImage(product.image);
  }, [product]);

  const addToCart = () => {
    cartActions.add(product, qty);
    toast.success(`${qty}x "${product.nom}" ajoute au panier avec succes`);
  };

  const buyNow = () => {
    cartActions.add(product, qty);
    navigate("/panier");
  };

  const phoneNumber = "221772901490";
  const whatsappMessage = encodeURIComponent(
    `Bonjour ${product.vendeur}, je suis interesse(e) par votre produit "${product.nom}" (Ref: ${product.id.toUpperCase()}) sur SenBazar.`
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

  const startInternalChat = () => {
    setContactOpen(false);
    toast.info(`Ouverture de la messagerie interne avec ${product.vendeur}...`);
  };

  return (
    <div className="min-h-screen bg-background antialiased">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition">Accueil</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <Link to="/catalogue" className="hover:text-foreground transition">Catalogue</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <Link to={`/catalogue?cat=${product.categorie}`} className="hover:text-foreground transition">{cat?.nom}</Link>
          <ChevronRight className="h-3 w-3 opacity-60" />
          <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{product.nom}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 items-start">
          <div className="space-y-3">
            <div className="aspect-square overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm group">
              <img
                src={mainImage}
                alt={product.nom}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          <div className="flex flex-col">
            {product.promotion && (
              <span className="mb-3 self-start inline-flex items-center rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-black text-rose-600 tracking-wide uppercase">
                Promotion -{product.promotion}%
              </span>
            )}

            <h1 className="font-display text-2xl font-black tracking-tight text-foreground md:text-3xl lg:leading-tight">
              {product.nom}
            </h1>

            <div className="mt-3 flex items-center gap-3 text-xs font-bold border-b border-border/40 pb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < Math.round(product.note) ? "fill-amber-400 text-amber-400" : "text-muted/60 stroke-[2]"}`}
                  />
                ))}
              </div>
              <span className="text-foreground bg-muted px-1.5 py-0.5 rounded-md text-[11px] font-black">{product.note.toFixed(1)}</span>
              <span className="text-muted-foreground font-medium">({product.avis} avis certifies)</span>
            </div>

            <div className="mt-5 flex items-baseline gap-4 bg-muted/20 p-4 rounded-2xl border border-border/40">
              <span className="font-display text-3xl font-black text-primary tracking-tight">
                {formatFCFA(product.prix)}
              </span>
              {product.ancienPrix && (
                <span className="text-base text-muted-foreground font-semibold line-through opacity-70">
                  {formatFCFA(product.ancienPrix)}
                </span>
              )}
            </div>

            <p className="mt-5 text-xs font-medium leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 text-xs font-bold">
              <span className={`h-2 w-2 rounded-full ${product.stock > 5 ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"}`} />
              <span className={product.stock > 5 ? "text-emerald-600" : "text-amber-600"}>
                {product.stock > 5 ? "Disponible immediatement" : `Stock limite : plus que ${product.stock} unites`}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-border/40 pb-6">
              <div className="flex items-center rounded-xl border border-border bg-card shadow-inner">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-11 w-11 place-items-center text-muted-foreground">
                  <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
                <span className="w-8 text-center text-xs font-black text-foreground">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="grid h-11 w-11 place-items-center text-muted-foreground">
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              </div>

              <button onClick={addToCart} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary h-11 px-6 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shadow-sm">
                <ShoppingCart className="h-4 w-4 stroke-[2.2]" /> Ajouter au panier
              </button>

              <button onClick={buyNow} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-foreground h-11 px-6 text-xs font-bold text-background hover:bg-foreground/90 transition shadow-sm">
                <Zap className="h-4 w-4 fill-current stroke-none" /> Acheter maintenant
              </button>

              <button
                onClick={() => cartActions.toggleFav(product.id)}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition ${isFav ? "border-rose-200 bg-rose-50 text-rose-500" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-card p-3 text-center shadow-xs">
                <Truck className="h-4 w-4 text-primary stroke-[2]" /> <span>Livraison 24h</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-card p-3 text-center shadow-xs">
                <Shield className="h-4 w-4 text-primary stroke-[2]" /> <span>Paiement securise</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-card p-3 text-center shadow-xs">
                <RotateCcw className="h-4 w-4 text-primary stroke-[2]" /> <span>Retour sous 7j</span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3.5 rounded-2xl border border-border/60 bg-muted/10 p-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary shadow-inner">
                <Store className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-foreground truncate">{product.vendeur}</div>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <CheckCircle className="h-3 w-3 fill-current text-emerald-100" /> Vendeur verifie SenBazar
                </div>
              </div>

              <button
                onClick={() => setContactOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-[11px] font-bold text-foreground/80 hover:bg-muted hover:text-primary transition shadow-sm"
              >
                <MessageCircle className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" /> Contacter
              </button>
            </div>
          </div>
        </div>

        <div className="mt-14">
          <div className="flex gap-2 border-b border-border/60 overflow-x-auto scrollbar-none">
            {([["desc", "Description globale"], ["specs", "Fiche technique"], ["avis", `Avis clients (${product.avis})`]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap -mb-px transition-all duration-200 ${tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="rounded-b-2xl border border-t-0 border-border/60 bg-card p-6 text-xs font-semibold text-muted-foreground leading-relaxed shadow-sm">
            {tab === "desc" && (
              <div className="space-y-3">
                <p>{product.description}</p>
                <p>Ce produit a ete rigoureusement selectionne par notre equipe pour sa robustesse, sa qualite de fabrication superieure et son excellent rapport qualite-prix. Concu specifiquement pour durer, il s'integre parfaitement aux exigences et au rythme de vie de votre quotidien au Senegal.</p>
              </div>
            )}

            {tab === "specs" && (
              <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {[
                  ["Marque deposee", product.marque],
                  ["Rayon d'achat", cat?.nom ?? "Non classe"],
                  ["Reference produit", product.id.toUpperCase()],
                  ["Etat des stocks", `${product.stock} unites restantes`],
                  ["Garantie legale", "12 mois constructeur"],
                  ["Expedition locale", product.livraisonGratuite ? "Entierement gratuite" : "A partir de 2 000 FCFA"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border/40 py-2.5">
                    <dt className="text-muted-foreground/80">{k}</dt>
                    <dd className="font-bold text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {tab === "avis" && (
              <div className="space-y-4 divide-y divide-border/40">
                <p className="pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Avis representatifs (echantillon)</p>
                {[
                  { author: "Aissatou D.", rating: 5, comment: "Tres bonne qualite globale, et surtout la livraison a ete extremement rapide sur Dakar !" },
                  { author: "Mamadou S.", rating: 4, comment: "Parfaitement conforme a la description de la fiche technique, tres satisfait de mon investissement." },
                ].map((review, idx) => (
                  <div key={idx} className="pt-4 first:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs">{review.author}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`h-3 w-3 ${j < review.rating ? "fill-amber-400 text-amber-400" : "text-muted/40"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1.5 text-muted-foreground font-medium text-[11px]">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-16">
            <div className="mb-6">
              <h2 className="font-display text-xl font-black tracking-tight text-foreground">Vous aimerez aussi</h2>
              <p className="text-xs font-medium text-muted-foreground">Decouvrez d'autres articles similaires de la meme categorie.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setContactOpen(false)}
          />

          <div className="relative w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-10">
            <button
              onClick={() => setContactOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              aria-label="Fermer le popup"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center pb-5 border-b border-border/40">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-black text-foreground">Contacter le vendeur</h3>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                Discutez directement avec <span className="font-bold text-foreground">{product.vendeur}</span>
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setContactOpen(false)}
                className="flex items-center gap-3.5 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/15"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10">
                  <Phone className="h-4 w-4 fill-current stroke-none" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="truncate">Discuter via WhatsApp</div>
                  <div className="text-[10px] font-medium opacity-85 mt-0.5">Commande ou details instantanes</div>
                </div>
                <ChevronRight className="h-4 w-4 opacity-70" />
              </a>

              <button
                onClick={startInternalChat}
                className="flex items-center gap-3.5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs font-bold text-foreground hover:bg-muted transition"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="truncate">Messagerie SenBazar</div>
                  <div className="text-[10px] font-medium text-muted-foreground mt-0.5">Ouvrir un chat sur la plateforme</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="mt-5 text-[10px] font-medium text-center text-muted-foreground bg-muted/30 p-2.5 rounded-xl">
              Votre reference produit sera partagee automatiquement pour faciliter l'echange.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
