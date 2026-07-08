import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X, Search, SlidersHorizontal, ArrowUpDown, ChevronRight, RotateCcw } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, products as fallbackProducts, type Product } from "@/lib/mock-data";
import { fetchProducts } from "@/lib/api";

type Sort = "pertinence" | "prix_asc" | "prix_desc" | "nouveau" | "ventes" | "note";

const catalogueStyles = `
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

export function CataloguePage() {
  const [searchParams] = useSearchParams();
  const cat = searchParams.get("cat") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const promo = searchParams.get("promo") === "true";

  const [selectedCat, setSelectedCat] = useState<string | undefined>(cat);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(500000);
  const [minNote, setMinNote] = useState<number>(0);
  const [promoOnly, setPromoOnly] = useState<boolean>(promo);
  const [freeShip, setFreeShip] = useState<boolean>(false);
  const [inStock, setInStock] = useState<boolean>(false);
  const [query, setQuery] = useState<string>(q ?? "");
  const [sort, setSort] = useState<Sort>("pertinence");
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [items, setItems] = useState<Product[]>(fallbackProducts);

  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    document.title = "Catalogue | SenBazar";
    fetchProducts().then(setItems);
  }, []);

  useEffect(() => {
    setSelectedCat(cat);
  }, [cat]);

  useEffect(() => {
    if (promo) setPromoOnly(true);
  }, [promo]);

  const filteredAndSorted = useMemo(() => {
    let list = items.filter((p) => {
      if (selectedCat && p.categorie !== selectedCat) return false;
      if (query && !p.nom.toLowerCase().includes(query.toLowerCase())) return false;
      if (p.prix < minPrice || p.prix > maxPrice) return false;
      if (p.note < minNote) return false;
      if (promoOnly && !p.promotion) return false;
      if (freeShip && !p.livraisonGratuite) return false;
      if (inStock && p.stock <= 0) return false;
      return true;
    });

    if (sort === "prix_asc") list = [...list].sort((a, b) => a.prix - b.prix);
    if (sort === "prix_desc") list = [...list].sort((a, b) => b.prix - a.prix);
    if (sort === "nouveau") list = [...list].sort((a, b) => Number(!!b.nouveau) - Number(!!a.nouveau));
    if (sort === "note") list = [...list].sort((a, b) => b.note - a.note);
    if (sort === "ventes") list = [...list].sort((a, b) => b.avis - a.avis);

    return list;
  }, [selectedCat, query, minPrice, maxPrice, minNote, promoOnly, freeShip, inStock, sort, items]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredAndSorted.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSorted, page]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSelectedCat(undefined);
    setMinPrice(0);
    setMaxPrice(500000);
    setMinNote(0);
    setPromoOnly(false);
    setFreeShip(false);
    setInStock(false);
    setQuery("");
    setSort("pertinence");
    setPage(1);
  };

  const handleCategoryChange = (slug: string | undefined) => {
    setSelectedCat(slug);
    setPage(1);
  };

  const FiltersComponent = (
    <div className="space-y-6 text-xs font-semibold">
      <div className="border-b border-border/60 pb-5">
        <h4 className="mb-3 text-[11px] font-black uppercase tracking-wider text-foreground flex items-center gap-2">
          Rayons
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition ${!selectedCat ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <span>Toutes les catégories</span>
            {!selectedCat && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => handleCategoryChange(c.slug)}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition ${selectedCat === c.slug ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <span className="truncate">{c.nom}</span>
              <span className="text-[10px] opacity-60 font-medium bg-muted px-1.5 py-0.5 rounded-md group-hover:bg-background">
                {c.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-border/60 pb-5">
        <h4 className="mb-3 text-[11px] font-black uppercase tracking-wider text-foreground">Budget (FCFA)</h4>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">Min</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => { setMinPrice(+e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-border bg-background pl-8 pr-2 py-2 font-bold outline-none focus:border-primary text-xs"
            />
          </div>
          <span className="text-muted-foreground/40 font-medium">-</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">Max</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(+e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-border bg-background pl-8 pr-2 py-2 font-bold outline-none focus:border-primary text-xs"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-border/60 pb-5">
        <h4 className="mb-3 text-[11px] font-black uppercase tracking-wider text-foreground">Avis clients</h4>
        <div className="relative">
          <select
            value={minNote}
            onChange={(e) => { setMinNote(+e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary appearance-none cursor-pointer"
          >
            <option value={0}>Toutes les notes</option>
            <option value={3}>3 étoiles et plus</option>
            <option value={4}>4 étoiles et plus</option>
            <option value={4.5}>4.5 étoiles et plus</option>
          </select>
          <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="space-y-2.5 pb-2">
        {[
          { id: "promo", label: "En promotion uniquement", val: promoOnly, set: setPromoOnly },
          { id: "ship", label: "Livraison gratuite", val: freeShip, set: setFreeShip },
          { id: "stock", label: "En stock uniquement", val: inStock, set: setInStock },
        ].map((opt) => (
          <label key={opt.id} className="flex items-center gap-3 cursor-pointer group text-muted-foreground hover:text-foreground transition">
            <input
              type="checkbox"
              checked={opt.val}
              onChange={(e) => { opt.set(e.target.checked); setPage(1); }}
              className="h-4 w-4 rounded-md border-border text-primary focus:ring-primary/20 accent-primary"
            />
            <span className="text-xs font-semibold">{opt.label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          className="flex-grow rounded-xl bg-primary py-2.5 text-center text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shadow-sm"
          onClick={() => setFiltersOpen(false)}
        >
          Appliquer les filtres
        </button>
        <button
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition"
          onClick={resetFilters}
          title="Réinitialiser"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background antialiased font-sans">
      <style>{catalogueStyles}</style>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10 animate-slide-up">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-6">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">E-Commerce</div>
            <h1 className="font-display text-2xl font-black tracking-tight md:text-4xl text-foreground">
              Notre Catalogue
            </h1>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Rechercher un produit précis..."
              className="w-full rounded-full border border-border bg-card py-2.5 pl-11 pr-4 text-xs font-semibold placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(var(--primary),0.08)] transition"
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
          <aside className="hidden lg:block rounded-2xl border border-border/60 bg-card p-5 h-fit sticky top-28 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-border/40 pb-3">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-black uppercase tracking-tight">Filtres avancés</h3>
            </div>
            {FiltersComponent}
          </aside>

          <div className="lg:hidden flex items-center justify-between bg-card p-3 rounded-xl border border-border/60">
            <span className="text-xs font-bold text-muted-foreground">{filteredAndSorted.length} articles trouvés</span>
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-xs font-bold text-background shadow-sm"
            >
              <Filter className="h-3.5 w-3.5" /> Filtrer et trier
            </button>
          </div>

          <section className="space-y-6">
            <div className="hidden lg:flex items-center justify-between border-b border-border/30 pb-3">
              <p className="text-xs font-bold text-muted-foreground tracking-wide">
                {filteredAndSorted.length} résultat{filteredAndSorted.length > 1 ? "s" : ""} trouvé{filteredAndSorted.length > 1 ? "s" : ""}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Trier par:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as Sort)}
                    className="rounded-xl border border-border bg-card pl-3 pr-8 py-1.5 text-xs font-bold cursor-pointer outline-none focus:border-primary appearance-none"
                  >
                    <option value="pertinence">Pertinence</option>
                    <option value="prix_asc">Prix : du - au +</option>
                    <option value="prix_desc">Prix : du + au -</option>
                    <option value="nouveau">Nouveautés</option>
                    <option value="ventes">Meilleures ventes</option>
                    <option value="note">Mieux notés</option>
                  </select>
                  <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {paginatedItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-card p-16 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3">
                <SlidersHorizontal className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-bold">Aucun produit ne correspond à vos critères de recherche.</p>
                <button onClick={resetFilters} className="text-xs font-bold text-primary hover:underline">
                  Réinitialiser tous les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-1.5 border-t border-border/40 pt-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="px-3 h-9 rounded-xl border border-border bg-card text-xs font-bold transition hover:bg-muted disabled:opacity-40 disabled:hover:bg-card"
                >
                  Précédent
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const pageNumber = idx + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-black transition ${page === pageNumber ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "border border-border bg-card hover:bg-muted"}`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  className="inline-flex items-center gap-1 px-3 h-9 rounded-xl border border-border bg-card text-xs font-bold transition hover:bg-muted disabled:opacity-40 disabled:hover:bg-card"
                >
                  Suivant <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-card p-6 shadow-2xl border-t border-border flex flex-col">
            <div className="mb-5 flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-black uppercase tracking-tight">Filtres de recherche</h3>
              </div>
              <button className="rounded-lg p-1.5 hover:bg-muted" onClick={() => setFiltersOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 space-y-2 border-b border-border/40 pb-5">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-foreground">Trier par</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "pertinence", label: "Pertinence" },
                  { value: "prix_asc", label: "Prix croissant" },
                  { value: "prix_desc", label: "Prix décroissant" },
                  { value: "nouveau", label: "Nouveautés" },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSort(s.value as Sort)}
                    className={`rounded-xl px-3 py-2 text-left text-xs font-semibold border ${sort === s.value ? "bg-primary/10 border-primary text-primary" : "border-border bg-background text-muted-foreground"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {FiltersComponent}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
