import type { Role, User } from "./auth-store";

// Role-based access control for the marketplace. Each shop/vendor is still a single
// tenant in the data model (Vendeur.utilisateur), but the areas below are about which
// UI sections a given *role* may enter - not about isolating separate customer orgs.

export const PLATFORM_PHONE_RAW = "772901490";
export const PLATFORM_PHONE_DISPLAY = "+221 77 290 14 90";
export const PLATFORM_PHONE_LINK = "tel:+221772901490";

export type AccessArea = "marketplace" | "client" | "seller" | "admin" | "checkout";

export type RoleAccessConfig = {
  role: Role;
  label: string;
  home: string;
  showMarketplaceNavbar: boolean;
  canShop: boolean;
  canCheckout: boolean;
  canManageOwnShop: boolean;
  canManageShops: boolean;
  canConfirmOrders: boolean;
};

export const roleAccessConfig: Record<Role, RoleAccessConfig> = {
  visiteur: {
    role: "visiteur",
    label: "Visiteur",
    home: "/",
    showMarketplaceNavbar: true,
    canShop: true,
    canCheckout: true,
    canManageOwnShop: false,
    canManageShops: false,
    canConfirmOrders: false,
  },
  client: {
    role: "client",
    label: "Client",
    home: "/compte",
    showMarketplaceNavbar: true,
    canShop: true,
    canCheckout: true,
    canManageOwnShop: false,
    canManageShops: false,
    canConfirmOrders: false,
  },
  vendeur: {
    role: "vendeur",
    label: "Vendeur",
    home: "/vendeur",
    showMarketplaceNavbar: false,
    canShop: false,
    canCheckout: false,
    canManageOwnShop: true,
    canManageShops: false,
    canConfirmOrders: true,
  },
  admin: {
    role: "admin",
    label: "Admin",
    home: "/admin",
    showMarketplaceNavbar: false,
    canShop: false,
    canCheckout: false,
    canManageOwnShop: false,
    canManageShops: true,
    canConfirmOrders: true,
  },
};

export const areaAccess: Record<AccessArea, Role[]> = {
  marketplace: ["visiteur", "client"],
  client: ["client"],
  seller: ["vendeur"],
  admin: ["admin"],
  // Le paiement reste accessible sans compte : un visiteur qui valide sa commande
  // se voit creer un compte client leger a partir de ses coordonnees de livraison
  // (voir PaiementPage), car une Commande backend est toujours rattachee a un Utilisateur.
  checkout: ["visiteur", "client"],
};

export function getRoleAccess(user: User) {
  return roleAccessConfig[user.role] ?? roleAccessConfig.visiteur;
}

export function canAccessArea(role: Role, area: AccessArea) {
  return areaAccess[area].includes(role);
}

export function defaultRedirectForRole(role: Role) {
  return roleAccessConfig[role]?.home ?? "/";
}
