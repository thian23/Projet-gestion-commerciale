import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">Cette page n'existe pas ou a ete deplacee.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Retour a l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
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

  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-muted-foreground">Essayez de recharger la page.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => window.location.reload()} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Reessayer</button>
          <Link to="/" className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">Accueil</Link>
        </div>
      </div>
    </div>
  );
}
