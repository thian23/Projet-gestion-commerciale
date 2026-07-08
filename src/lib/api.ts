import { products as fallbackProducts, type Product } from "./mock-data";
import type { Role, User } from "./auth-store";
import { getToken, setToken, clearToken } from "./token";
import { authActions } from "./auth-store";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

export class ApiError extends Error {}

type BackendProduct = {
  id: number;
  nom: string;
  description?: string;
  prix: number | string;
  ancienPrix?: number | string | null;
  stock: number;
  image?: string;
  categorieId: number;
  categorieNom: string;
  vendeurId: number;
  nomBoutique: string;
  promotion?: number | string | null;
  noteMoyenne?: number | string | null;
  avis?: number | null;
  livraisonGratuite?: boolean | null;
  nouveau?: boolean | null;
  marque?: string | null;
};

type AuthResponse = {
  id: number;
  nom: string;
  email: string;
  role: "ACHETEUR" | "VENDEUR" | "ADMIN";
  telephone?: string;
  adresse?: string;
  token: string;
  vendeurId: number | null;
};

const slugByCategory: Record<string, string> = {
  Vetements: "vetements",
  Chaussures: "chaussures",
  Accessoires: "accessoires",
  Beaute: "beaute",
  Informatique: "informatique",
  Maison: "maison",
  Electronique: "electronique",
  Sport: "sport",
};

let offline = false;
const offlineListeners = new Set<() => void>();
export const isOffline = () => offline;
export const subscribeOffline = (cb: () => void) => {
  offlineListeners.add(cb);
  return () => offlineListeners.delete(cb);
};
function setOffline(next: boolean) {
  if (offline === next) return;
  offline = next;
  offlineListeners.forEach((l) => l());
}

const toNumber = (value: number | string | null | undefined) => Number(value ?? 0);

const toProduct = (p: BackendProduct): Product => ({
  id: String(p.id),
  nom: p.nom,
  categorie: slugByCategory[p.categorieNom] ?? p.categorieNom.toLowerCase(),
  prix: toNumber(p.prix),
  ancienPrix: p.ancienPrix == null ? undefined : toNumber(p.ancienPrix),
  note: toNumber(p.noteMoyenne),
  avis: p.avis ?? 0,
  stock: p.stock,
  promotion: p.promotion == null || toNumber(p.promotion) === 0 ? undefined : toNumber(p.promotion),
  image: p.image || fallbackProducts[0].image,
  vendeur: p.nomBoutique,
  vendeurNote: 4.6,
  description: p.description ?? "Produit SenBazar",
  livraisonGratuite: Boolean(p.livraisonGratuite),
  nouveau: Boolean(p.nouveau),
  marque: p.marque ?? p.nomBoutique,
});

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (res.status === 401) {
    clearToken();
    authActions.logout();
  }
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message || message;
    } catch {}
    throw new ApiError(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const data = await request<BackendProduct[]>("/products");
    setOffline(false);
    return data.map(toProduct);
  } catch {
    setOffline(true);
    return fallbackProducts;
  }
}

export async function fetchProduct(id: string): Promise<Product | undefined> {
  try {
    const data = await request<BackendProduct>(`/products/${id}`);
    setOffline(false);
    return toProduct(data);
  } catch {
    setOffline(true);
    return fallbackProducts.find((p) => p.id === id);
  }
}

export async function fetchProductsBySeller(sellerId: string): Promise<Product[]> {
  const data = await request<BackendProduct[]>(`/products/seller/${sellerId}`);
  return data.map(toProduct);
}

export type ProductInput = {
  nom: string;
  description?: string;
  prix: number;
  ancienPrix?: number | null;
  stock: number;
  image?: string;
  categorieId: number;
  promotion?: number;
  marque?: string;
};

export async function createProduct(input: ProductInput): Promise<Product> {
  const data = await request<BackendProduct>("/products", {
    method: "POST",
    body: JSON.stringify({ ...input, vendeurId: 0 }),
  });
  return toProduct(data);
}

export async function updateProduct(id: string, input: ProductInput & { vendeurId?: number }): Promise<Product> {
  const data = await request<BackendProduct>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify({ vendeurId: 0, ...input }),
  });
  return toProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  await request(`/products/${id}`, { method: "DELETE" });
}

const roleToBackend = (role: Role) => role === "admin" ? "ADMIN" : role === "vendeur" ? "VENDEUR" : "ACHETEUR";
const roleFromBackend = (role: AuthResponse["role"]): Role => role === "ADMIN" ? "admin" : role === "VENDEUR" ? "vendeur" : "client";
const toUser = (data: AuthResponse): User => ({
  id: String(data.id),
  nom: data.nom,
  email: data.email,
  role: roleFromBackend(data.role),
  avatarLetter: (data.nom[0] || "U").toUpperCase(),
  vendeurId: data.vendeurId == null ? null : String(data.vendeurId),
});

export async function apiLogin(email: string, password: string): Promise<User> {
  const data = await request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, motDePasse: password }) });
  setToken(data.token);
  return toUser(data);
}

export async function apiRegister(nom: string, email: string, password: string, role: Role, nomBoutique?: string): Promise<User> {
  const data = await request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ nom, email, motDePasse: password, role: roleToBackend(role), nomBoutique }),
  });
  setToken(data.token);
  return toUser(data);
}

// ---------- Categories ----------

export type CategoryDto = { id: number; nom: string; description?: string; image?: string };

export async function fetchCategoriesRaw(): Promise<CategoryDto[]> {
  return request<CategoryDto[]>("/categories");
}
export async function createCategory(input: { nom: string; description?: string; image?: string }): Promise<CategoryDto> {
  return request<CategoryDto>("/categories", { method: "POST", body: JSON.stringify(input) });
}
export async function updateCategory(id: number, input: { nom: string; description?: string; image?: string }): Promise<CategoryDto> {
  return request<CategoryDto>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(input) });
}
export async function deleteCategory(id: number): Promise<void> {
  await request(`/categories/${id}`, { method: "DELETE" });
}

// ---------- Sellers (Vendeur / boutiques) ----------

export type SellerStatus = "EN_ATTENTE" | "VALIDE" | "BLOQUE";
export type Seller = {
  id: string;
  utilisateurId: string;
  ownerNom: string;
  nomBoutique: string;
  description?: string;
  logo?: string;
  statut: SellerStatus;
};

type BackendVendeur = { id: number; utilisateurId: number; nomUtilisateur: string; nomBoutique: string; description?: string; logo?: string; statut: SellerStatus };

const toSeller = (v: BackendVendeur): Seller => ({
  id: String(v.id),
  utilisateurId: String(v.utilisateurId),
  ownerNom: v.nomUtilisateur,
  nomBoutique: v.nomBoutique,
  description: v.description,
  logo: v.logo,
  statut: v.statut,
});

export async function fetchSellers(): Promise<Seller[]> {
  const data = await request<BackendVendeur[]>("/sellers");
  return data.map(toSeller);
}

export async function fetchSeller(id: string): Promise<Seller> {
  const data = await request<BackendVendeur>(`/sellers/${id}`);
  return toSeller(data);
}

export async function updateSellerStatus(seller: Seller, statut: SellerStatus): Promise<Seller> {
  const data = await request<BackendVendeur>(`/sellers/${seller.id}`, {
    method: "PUT",
    body: JSON.stringify({ utilisateurId: Number(seller.utilisateurId), nomBoutique: seller.nomBoutique, description: seller.description, logo: seller.logo, statut }),
  });
  return toSeller(data);
}

export async function updateShopProfile(seller: Seller, input: { nomBoutique: string; description?: string; logo?: string }): Promise<Seller> {
  const data = await request<BackendVendeur>(`/sellers/${seller.id}`, {
    method: "PUT",
    body: JSON.stringify({ utilisateurId: Number(seller.utilisateurId), ...input, statut: seller.statut }),
  });
  return toSeller(data);
}

// ---------- Cart ----------

export type CartLine = { id: string; produitId: string; nom: string; prixUnitaire: number; quantite: number; sousTotal: number };

type BackendPanier = { id: number; utilisateurId: number; produitId: number; produitNom: string; prixUnitaire: number; quantite: number; sousTotal: number };

const toCartLine = (c: BackendPanier): CartLine => ({
  id: String(c.id),
  produitId: String(c.produitId),
  nom: c.produitNom,
  prixUnitaire: toNumber(c.prixUnitaire),
  quantite: c.quantite,
  sousTotal: toNumber(c.sousTotal),
});

export async function fetchServerCart(userId: string): Promise<CartLine[]> {
  const data = await request<BackendPanier[]>(`/carts/user/${userId}`);
  return data.map(toCartLine);
}

export async function syncGuestCartToServer(userId: string, items: { productId: string; quantite: number }[]): Promise<void> {
  for (const item of items) {
    try {
      await request("/carts", {
        method: "POST",
        body: JSON.stringify({ utilisateurId: Number(userId), produitId: Number(item.productId), quantite: item.quantite }),
      });
    } catch {
      // le produit est peut-etre deja dans le panier serveur ou le stock est insuffisant : on ignore et on continue
    }
  }
}

export async function clearServerCart(userId: string): Promise<void> {
  await request(`/carts/user/${userId}`, { method: "DELETE" });
}

// ---------- Orders / Order details / Payments ----------

export type OrderStatus = "EN_ATTENTE" | "PAYEE" | "EXPEDIEE" | "LIVREE" | "ANNULEE";

export type Order = {
  id: string;
  utilisateurId: string;
  clientNom: string;
  date: string;
  montantTotal: number;
  statut: OrderStatus;
  modePaiement: string;
  adresseLivraison: string;
  telephone: string;
};

export type OrderDetail = { id: string; commandeId: string; produitId: string; nom: string; quantite: number; prixUnitaire: number; sousTotal: number };

type BackendCommande = {
  id: number; utilisateurId: number; nomUtilisateur: string; dateCommande: string; montantTotal: number | string;
  statut: OrderStatus; modePaiement: string; adresseLivraison: string; telephone: string;
};
type BackendOrderDetail = { id: number; commandeId: number; produitId: number; produitNom: string; quantite: number; prixUnitaire: number | string; sousTotal: number | string };

const toOrder = (o: BackendCommande): Order => ({
  id: String(o.id),
  utilisateurId: String(o.utilisateurId),
  clientNom: o.nomUtilisateur,
  date: o.dateCommande,
  montantTotal: toNumber(o.montantTotal),
  statut: o.statut,
  modePaiement: o.modePaiement,
  adresseLivraison: o.adresseLivraison,
  telephone: o.telephone,
});

const toOrderDetail = (d: BackendOrderDetail): OrderDetail => ({
  id: String(d.id),
  commandeId: String(d.commandeId),
  produitId: String(d.produitId),
  nom: d.produitNom,
  quantite: d.quantite,
  prixUnitaire: toNumber(d.prixUnitaire),
  sousTotal: toNumber(d.sousTotal),
});

export const orderStatusFlow: OrderStatus[] = ["EN_ATTENTE", "PAYEE", "EXPEDIEE", "LIVREE"];
export const orderStatusLabel: Record<OrderStatus, string> = {
  EN_ATTENTE: "En attente",
  PAYEE: "Payee",
  EXPEDIEE: "Expediee",
  LIVREE: "Livree",
  ANNULEE: "Annulee",
};
export const orderStatusColor = (s: OrderStatus): string => ({
  EN_ATTENTE: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  PAYEE: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  EXPEDIEE: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  LIVREE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  ANNULEE: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
})[s];

export async function fetchAllOrders(): Promise<Order[]> {
  const data = await request<BackendCommande[]>("/orders");
  return data.map(toOrder);
}

export async function fetchOrdersForUser(userId: string): Promise<Order[]> {
  const data = await request<BackendCommande[]>(`/orders/user/${userId}`);
  return data.map(toOrder);
}

export async function fetchOrdersForSeller(sellerId: string): Promise<Order[]> {
  const data = await request<BackendCommande[]>(`/orders/seller/${sellerId}`);
  return data.map(toOrder);
}

export async function fetchOrderDetails(orderId: string): Promise<OrderDetail[]> {
  const data = await request<BackendOrderDetail[]>(`/order-details/order/${orderId}`);
  return data.map(toOrderDetail);
}

export async function updateOrderStatus(order: Order, statut: OrderStatus): Promise<Order> {
  const data = await request<BackendCommande>(`/orders/${order.id}`, {
    method: "PUT",
    body: JSON.stringify({
      utilisateurId: Number(order.utilisateurId),
      montantTotal: order.montantTotal,
      statut,
      modePaiement: order.modePaiement,
      adresseLivraison: order.adresseLivraison,
      telephone: order.telephone,
    }),
  });
  return toOrder(data);
}

export async function placeOrder(params: {
  userId: string;
  items: { produitId: string; nom: string; prix: number; quantite: number }[];
  total: number;
  modePaiement: string;
  adresseLivraison: string;
  telephone: string;
  paye: boolean;
}): Promise<Order> {
  const created = await request<BackendCommande>("/orders", {
    method: "POST",
    body: JSON.stringify({
      utilisateurId: Number(params.userId),
      montantTotal: params.total,
      statut: params.paye ? "PAYEE" : "EN_ATTENTE",
      modePaiement: params.modePaiement,
      adresseLivraison: params.adresseLivraison,
      telephone: params.telephone,
    }),
  });

  await Promise.all(
    params.items.map((item) =>
      request("/order-details", {
        method: "POST",
        body: JSON.stringify({ commandeId: created.id, produitId: Number(item.produitId), quantite: item.quantite, prixUnitaire: item.prix }),
      })
    )
  );

  await request("/payments", {
    method: "POST",
    body: JSON.stringify({
      commandeId: created.id,
      montant: params.total,
      moyenPaiement: params.modePaiement,
      statut: params.paye ? "PAYE" : "EN_ATTENTE",
      identifiantTransaction: `TXN-${created.id}-${Math.floor(Math.random() * 100000)}`,
    }),
  });

  await clearServerCart(params.userId).catch(() => {});

  return toOrder(created);
}

// ---------- Users (admin) ----------

export type AdminUser = {
  id: string;
  nom: string;
  email: string;
  role: "ACHETEUR" | "VENDEUR" | "ADMIN";
  telephone?: string;
  adresse?: string;
  dateInscription: string;
  bloque: boolean;
};

type BackendUtilisateur = { id: number; nom: string; email: string; role: AdminUser["role"]; telephone?: string; adresse?: string; dateInscription: string; bloque: boolean };

const toAdminUser = (u: BackendUtilisateur): AdminUser => ({
  id: String(u.id),
  nom: u.nom,
  email: u.email,
  role: u.role,
  telephone: u.telephone,
  adresse: u.adresse,
  dateInscription: u.dateInscription,
  bloque: Boolean(u.bloque),
});

export async function fetchUsers(): Promise<AdminUser[]> {
  const data = await request<BackendUtilisateur[]>("/users");
  return data.map(toAdminUser);
}

export async function toggleUserBlocked(id: string, bloque: boolean): Promise<AdminUser> {
  const data = await request<BackendUtilisateur>(`/users/${id}/bloque`, { method: "PATCH", body: JSON.stringify({ bloque }) });
  return toAdminUser(data);
}
