import type { User } from "@/types/api";

const TOKEN_KEY = "p2app_token";
const USER_KEY = "p2app_user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function setStoredUser(user: User) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const rawUser = window.localStorage.getItem(USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    return null;
  }
}

export function isSupportUser(user: User | null) {
  return Boolean(
    user && (user.role === "admin" || user.tipo_usuario === "gerente" || user.tipo_usuario === "tecnico"),
  );
}

export function logout() {
  clearAuth();
  window.location.href = "/login";
}
