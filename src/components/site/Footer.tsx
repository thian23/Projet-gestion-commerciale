import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Send } from "lucide-react";
import { Link } from "react-router-dom";

const paymentMethods = ["Wave", "Orange Money", "Free Money", "Wizall Money", "Paiement a la livraison"];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-card/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-16">
        {/* Grille principale */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">

          {/* Section Marque / À propos */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 transition active:scale-98 w-fit">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground font-display font-black text-lg shadow-sm shadow-primary/10">
                S
              </div>
              <span className="font-display text-xl font-black tracking-tight text-foreground">
                Sen<span className="text-primary">Bazar</span>
              </span>
            </Link>
            <p className="text-xs font-medium leading-relaxed text-muted-foreground">
              La marketplace de confiance pour acheter et vendre en ligne en toute simplicité au Sénégal. Rejoignez notre communauté locale !
            </p>
            {/* Réseaux sociaux */}
            <div className="flex gap-2 pt-2">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter, href: "#", label: "Twitter" }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-muted/60 text-muted-foreground border border-border/40 hover:bg-primary hover:text-primary-foreground hover:border-transparent hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Liens utiles */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground mb-4">Liens utiles</h4>
            <ul className="space-y-2.5 text-xs font-semibold text-muted-foreground">
              <li><a href="#" className="transition hover:text-primary">À propos de nous</a></li>
              <li><a href="#" className="transition hover:text-primary">Conditions générales de vente</a></li>
              <li><a href="#" className="transition hover:text-primary">Politique de confidentialité</a></li>
              <li><a href="#" className="transition hover:text-primary">Centre d'aide & FAQ</a></li>
            </ul>
          </div>

          {/* Informations de contact */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground mb-4">Service Client</h4>
            <ul className="space-y-3 text-xs font-semibold text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Dakar, Sénégal</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href="tel:+221338000000" className="hover:text-primary transition">+221 33 800 00 00</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:hello@senbazar.sn" className="hover:text-primary transition">hello@senbazar.sn</a>
              </li>
            </ul>
          </div>

          {/* Newsletter & Solutions de paiement */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground mb-1">Newsletter</h4>
              <p className="text-xs font-medium text-muted-foreground">Recevez en exclusivité nos meilleures offres et promotions.</p>
            </div>

            <form className="flex overflow-hidden rounded-xl border border-border bg-background focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(var(--primary),0.1)] transition-all duration-300" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Votre adresse email"
                className="w-full bg-transparent px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
              <button
                type="submit"
                className="grid px-4 place-items-center bg-primary text-primary-foreground hover:bg-primary/95 transition-colors active:scale-98"
                aria-label="S'abonner"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* Badges de paiement sécurisés */}
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Paiements locaux sécurisés</p>
              <div className="flex flex-wrap gap-1.5">
                {paymentMethods.map((name) => (
                  <span key={name} className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Barre de copyright finale */}
        <div className="mt-12 border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-semibold text-muted-foreground">
          <div>
            &copy; 2026 <span className="text-foreground font-bold">SenBazar</span>. Tous droits réservés.
          </div>
          <div className="flex items-center gap-4 opacity-80">
            <a href="#" className="hover:underline">Sécurité</a>
            <span>&bull;</span>
            <a href="#" className="hover:underline">Plan du site</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
