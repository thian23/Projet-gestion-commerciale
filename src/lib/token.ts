const KEY = "senbazar_token";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
};

export const setToken = (token: string) => {
  if (typeof window !== "undefined") localStorage.setItem(KEY, token);
};

export const clearToken = () => {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
};
