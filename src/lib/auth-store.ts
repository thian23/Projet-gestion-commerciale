import { useSyncExternalStore } from "react";
import { clearToken } from "./token";

export type Role = "visiteur" | "client" | "vendeur" | "admin";

export type User = {
  id: string;
  nom: string;
  email: string;
  role: Role;
  avatarLetter: string;
  vendeurId: string | null;
};

const KEY = "senbazar_auth_v3";
const guest: User = { id: "guest", nom: "Visiteur", email: "", role: "visiteur", avatarLetter: "V", vendeurId: null };

let user: User = guest;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) user = JSON.parse(raw);
  } catch {}
}

const emit = () => {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(user));
  listeners.forEach((l) => l());
};

export const authActions = {
  setUser(next: User) {
    user = next;
    emit();
  },
  logout() {
    user = guest;
    clearToken();
    emit();
  },
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const useUser = () => useSyncExternalStore(subscribe, () => user, () => user);
export const isAuthenticated = () => user.role !== "visiteur";
