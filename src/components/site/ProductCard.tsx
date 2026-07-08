import { Link } from "react-router-dom";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { cartActions, useFavorites } from "@/lib/cart-store";
import { formatFCFA, type Product } from "@/lib/mock-data";

export function ProductCard({ product }: { product: Product }) {
  const favs = useFavorites();
  const isFav = favs.has(product.id);

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    cartActions.add(product, 1);
    toast.success(`${product.nom} ajoute au panier`);
  };
  const onFav = (e: React.MouseEvent) => {
    e.preventDefault();
    cartActions.toggleFav(product.id);
  };

  return (
    <Link
      to={`/produit/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img src={product.image} alt={product.nom} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.promotion && (
            <span className="rounded-md bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
              -{product.promotion}%
            </span>
          )}
          {product.nouveau && (
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
              Nouveau
            </span>
          )}
        </div>
        <button
          onClick={onFav}
          aria-label="Favori"
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-card/90 backdrop-blur hover:bg-card"
        >
          <Heart className={`h-4 w-4 ${isFav ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
        </button>
        {product.stock < 10 && (
          <span className="absolute bottom-2 left-2 rounded bg-warning/90 px-2 py-0.5 text-xs font-medium text-warning-foreground">
            Stock limite
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground">{product.nom}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
          <span>{product.note.toFixed(1)}</span>
          <span>({product.avis})</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <div className="font-display text-base font-bold text-primary">{formatFCFA(product.prix)}</div>
            {product.ancienPrix && (
              <div className="text-xs text-muted-foreground line-through">{formatFCFA(product.ancienPrix)}</div>
            )}
          </div>
          <button
            onClick={onAdd}
            aria-label="Ajouter au panier"
            className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground transition hover:bg-primary/90"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
