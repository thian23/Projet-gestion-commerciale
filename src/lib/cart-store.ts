import { useSyncExternalStore } from "react";
import type { Product } from "./mock-data";

export type CartItem = { product: Product; quantity: number };

let cart: CartItem[] = [];
let favorites: Set<string> = new Set();
const listeners = new Set<() => void>();

const STORAGE_KEY = "senbazar_cart_v2";
const FAV_KEY = "senbazar_fav_v1";

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) cart = JSON.parse(raw);
    const fav = localStorage.getItem(FAV_KEY);
    if (fav) favorites = new Set(JSON.parse(fav));
  } catch {}
}

const persist = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(favorites)));
};

const emit = () => {
  persist();
  listeners.forEach((l) => l());
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const cartActions = {
  add(product: Product, qty = 1) {
    const existing = cart.find((c) => c.product.id === product.id);
    if (existing) existing.quantity += qty;
    else cart = [...cart, { product, quantity: qty }];
    emit();
  },
  remove(id: string) {
    cart = cart.filter((c) => c.product.id !== id);
    emit();
  },
  setQty(id: string, qty: number) {
    cart = cart
      .map((c) => (c.product.id === id ? { ...c, quantity: Math.max(1, qty) } : c))
      .filter((c) => c.quantity > 0);
    emit();
  },
  clear() {
    cart = [];
    emit();
  },
  toggleFav(id: string) {
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    favorites = new Set(favorites);
    emit();
  },
};

export const useCart = () => useSyncExternalStore(subscribe, () => cart, () => cart);
export const useFavorites = () =>
  useSyncExternalStore(subscribe, () => favorites, () => favorites);

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.product.prix * i.quantity, 0);
export const cartCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0);
