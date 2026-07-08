import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, Search, Heart, ChevronDown, LogOut, LayoutDashboard, Store, X, MapPin, Phone, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart, cartCount, useFavorites } from "@/lib/cart-store";
import { useUser, authActions } from "@/lib/auth-store";
import { categories } from "@/lib/mock-data";
import * as Icons from "lucide-react";

export function Header() {
  const cart = useCart();
  const favs = useFavorites();
  const count = cartCount(cart);
  const user = useUser();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(false);
  const [account, setAccount] = useState(false);
  const [mega, setMega] = useState(false);
  const [q, setQ] = useState("");
  const accountRef = useRef<HTMLDivElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => { setMobile(false); setAccount(false); setMega(false); }, [location.pathname]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccount(false);
      if (!megaRef.current?.contains(e.target as Node)) setMega(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q ? `/catalogue?q=${encodeURIComponent(q)}` : "/catalogue");
  };

  const isAuth = user.role !== "visiteur";
  const dashboardHref = user.role === "admin" ? "/admin" : user.role === "vendeur" ? "/vendeur" : "/compte";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-card/80 backdrop-blur-md transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-foreground text-background text-[11px] font-medium tracking-wide border-b border-foreground/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
          <div className="flex items-center gap-5">
            <a href="tel:+221772901490" className="inline-flex items-center gap-1.5 transition opacity-80 hover:opacity-100">
              <Phone className="h-3 w-3 text-primary" /> +221 77 290 14 90
            </a>
            <span className="hidden md:inline-flex items-center gap-1.5 opacity-80">
              <MapPin className="h-3 w-3 text-primary" /> Livraison partout au Senegal
            </span>
          </div>
          <div className="flex items-center gap-4 font-semibold">
            <div className="flex items-center gap-1.5">
              <button className="transition opacity-100 text-primary">FR</button>
              <span className="opacity-20 text-[9px]">|</span>
              <button className="transition opacity-60 hover:opacity-100">EN</button>
            </div>
            <span className="opacity-20 text-[9px]">|</span>
            <span className="text-primary font-bold">FCFA</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4">
        {/* Mobile Menu Trigger */}
        <button
          className="lg:hidden p-2 -ml-2 rounded-xl transition hover:bg-muted active:scale-95"
          onClick={() => setMobile(true)}
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group transition-transform active:scale-98">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground font-display font-black text-lg shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
            S
          </div>
          <span className="hidden sm:inline font-display text-xl font-black tracking-tight text-foreground">
            Sen<span className="text-primary">Bazar</span>
          </span>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={submitSearch} className="relative hidden md:flex flex-1 max-w-2xl mx-4">
          <div className="flex w-full overflow-hidden rounded-full border border-border bg-background focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(var(--primary),0.1)] transition-all duration-300">
            <div className="relative hidden lg:flex items-center bg-muted/30 border-r border-border px-4 transition-colors hover:bg-muted/50">
              <select className="bg-transparent pr-4 text-xs font-bold text-muted-foreground outline-none cursor-pointer appearance-none">
                <option>Toutes categories</option>
                {categories.map((c) => <option key={c.slug}>{c.nom}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 h-3 w-3 text-muted-foreground pointer-events-none" />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Rechercher un produit, une marque, une categorie..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none"
            />
            <button type="submit" className="grid w-14 place-items-center bg-primary text-primary-foreground hover:bg-primary/95 transition-all active:scale-98" aria-label="Rechercher">
              <Search className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </form>

        {/* Action Controls */}
        <nav className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Wishlist Link */}
          <Link to="/compte" className="hidden sm:grid relative rounded-xl p-2.5 text-foreground/80 transition hover:bg-muted hover:text-foreground" aria-label="Liste des favoris">
            <Heart className="h-5 w-5" />
            {favs.size > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-black text-destructive-foreground animate-pulse">
                {favs.size}
              </span>
            )}
          </Link>

          {/* Account Interactive Dropdown */}
          <div ref={accountRef} className="relative">
            <button
              onClick={() => setAccount(!account)}
              className="flex items-center gap-2 rounded-xl p-1.5 pr-2.5 transition hover:bg-muted text-left group"
            >
              <div className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-bold transition-all ${isAuth ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "bg-muted text-muted-foreground border border-border group-hover:border-muted-foreground/30"}`}>
                {isAuth ? user.avatarLetter : <User className="h-4 w-4" />}
              </div>
              <div className="hidden lg:block leading-tight max-w-[90px]">
                <div className="text-[10px] font-medium text-muted-foreground">{isAuth ? "Bonjour," : "Espace"}</div>
                <div className="text-xs font-bold text-foreground truncate">{isAuth ? user.nom.split(" ")[0] : "Connexion"}</div>
              </div>
              <ChevronDown className={`hidden lg:block h-3 w-3 text-muted-foreground transition-transform duration-300 ${account ? "rotate-180" : ""}`} />
            </button>

            {account && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border/60 bg-card p-2 shadow-xl animate-fade-in-up z-50">
                {isAuth ? (
                  <>
                    <div className="border-b border-border/50 p-3 mb-1">
                      <div className="font-bold text-sm text-foreground truncate">{user.nom}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wide">
                        {user.role}
                      </div>
                    </div>
                    <Link to={dashboardHref} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-muted hover:text-foreground transition">
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Mon espace perso
                    </Link>
                    <Link to="/compte" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-muted hover:text-foreground transition">
                      <Heart className="h-4 w-4 text-muted-foreground" /> Mes favoris
                    </Link>
                    <div className="my-1 border-t border-border/40" />
                    <button
                      onClick={() => { authActions.logout(); navigate("/"); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 transition"
                    >
                      <LogOut className="h-4 w-4" /> Deconnexion
                    </button>
                  </>
                ) : (
                  <div className="p-2 space-y-2">
                    <Link to="/connexion" className="block w-full rounded-xl bg-primary py-2.5 text-center text-xs font-bold text-primary-foreground shadow-sm shadow-primary/10 hover:bg-primary/95 transition">
                      Se connecter
                    </Link>
                    <p className="text-center text-[11px] text-muted-foreground font-medium">
                      Nouveau client ? <Link to="/inscription" className="text-primary font-bold hover:underline">Creer un compte</Link>
                    </p>
                    <div className="my-2 border-t border-border/50" />
                    <Link to="/inscription?role=vendeur" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-muted transition">
                      <Store className="h-4 w-4 text-muted-foreground" /> Devenir vendeur local
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Icon Link */}
          <Link to="/panier" className="relative flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-primary-foreground hover:bg-primary/95 transition shadow-sm shadow-primary/10 active:scale-98" aria-label="Voir le panier">
            <ShoppingCart className="h-4 w-4 stroke-[2.2]" />
            <span className="hidden sm:inline text-xs font-bold">Panier</span>
            {count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-background px-1 text-[10px] font-black text-foreground shadow-sm">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>

      {/* Mobile Sticky Search Row */}
      <form onSubmit={submitSearch} className="border-t border-border/60 px-4 py-2.5 md:hidden bg-muted/20">
        <div className="flex overflow-hidden rounded-full border border-border bg-background focus-within:border-primary transition-all">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher des articles ou categories..."
            className="flex-1 bg-transparent px-4 py-2 text-xs text-foreground outline-none"
          />
          <button type="submit" className="grid w-12 place-items-center bg-primary text-primary-foreground" aria-label="Rechercher">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Categories Desktop bar & Mega menu */}
      <div className="hidden lg:block border-t border-border/60 bg-card/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 py-1.5">
            <div ref={megaRef} className="relative">
              <button
                onClick={() => setMega(!mega)}
                className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-xs font-bold text-background transition hover:bg-foreground/90 active:scale-98 shadow-sm"
              >
                <Menu className="h-3.5 w-3.5 stroke-[2.5]" /> Toutes nos categories <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${mega ? "rotate-180" : ""}`} />
              </button>

              {mega && (
                <div className="absolute left-0 top-full z-50 mt-2 w-[600px] rounded-xl border border-border bg-card p-4 shadow-2xl animate-fade-in-up">
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((c) => {
                      const Icon = (Icons as any)[c.icon] ?? Icons.Tag;
                      return (
                        <Link key={c.slug} to={`/catalogue?cat=${c.slug}`} className="flex items-center gap-3.5 rounded-xl px-3 py-2.5 hover:bg-muted transition group border border-transparent hover:border-border/40">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">{c.nom}</div>
                            <div className="text-[10px] font-medium text-muted-foreground mt-0.5">{c.count} produits disponibles</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links Horizontal bar */}
            <div className="flex items-center gap-0.5 pl-2">
              {categories.slice(0, 5).map((c) => (
                <Link key={c.slug} to={`/catalogue?cat=${c.slug}`} className="rounded-lg px-3 py-2 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  {c.nom}
                </Link>
              ))}
            </div>

            {/* Special Deals Link */}
            <Link to="/catalogue?promo=true" className="ml-auto inline-flex items-center gap-1 rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-500/20">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Offres speciales
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Slideout Overlay */}
      {mobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setMobile(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-card p-5 shadow-2xl flex flex-col justify-between border-r border-border animate-slide-right">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="font-display text-lg font-black tracking-tight">Menu principal</span>
                <button className="rounded-lg p-1.5 hover:bg-muted" onClick={() => setMobile(false)}><X className="h-4 w-4" /></button>
              </div>

              {/* Identity Box */}
              {isAuth ? (
                <Link to={dashboardHref} className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/10 p-3.5 transition hover:bg-primary/10">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/20">{user.avatarLetter}</div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-foreground truncate">{user.nom}</div>
                    <div className="text-[9px] font-bold uppercase text-primary tracking-wider mt-0.5">{user.role}</div>
                  </div>
                </Link>
              ) : (
                <Link to="/connexion" className="block w-full rounded-xl bg-primary py-3 text-center text-xs font-bold text-primary-foreground shadow-md shadow-primary/10">
                  Se connecter / S'inscrire
                </Link>
              )}

              {/* Category Tree Navigation */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Toutes les rayons</p>
                <div className="space-y-1 max-h-[40vh] overflow-y-auto pr-1">
                  {categories.map((c) => {
                    const Icon = (Icons as any)[c.icon] ?? Icons.Tag;
                    return (
                      <Link key={c.slug} to={`/catalogue?cat=${c.slug}`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-muted hover:text-foreground transition">
                        <Icon className="h-4 w-4 text-muted-foreground" /> {c.nom}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Footer Section for Mobile Menu */}
            <div className="space-y-1 border-t border-border/60 pt-4 mt-6">
              {!isAuth && (
                <Link to="/inscription?role=vendeur" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-foreground/80 hover:bg-muted transition">
                  <Store className="h-4 w-4 text-muted-foreground" /> Devenir vendeur local
                </Link>
              )}
              {isAuth && (
                <button
                  onClick={() => { authActions.logout(); setMobile(false); navigate("/"); }}
                  className="w-full text-left rounded-lg px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 transition mt-2"
                >
                  Deconnexion
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
