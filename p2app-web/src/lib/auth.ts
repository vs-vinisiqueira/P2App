import type { User } from "@/types/api";

const TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "app_token";
const USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY || "app_user";
const AUTH_CHANGED_EVENT = process.env.NEXT_PUBLIC_AUTH_EVENT || "app:auth-changed";
const AUTH_CHANNEL = process.env.NEXT_PUBLIC_AUTH_CHANNEL || "app-auth";

function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.postMessage(AUTH_CHANGED_EVENT);
    channel.close();
  }
}

export function subscribeToAuthChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const channel = "BroadcastChannel" in window ? new BroadcastChannel(AUTH_CHANNEL) : null;
  const handleAuthChange = () => onStoreChange();
  const handleStorageChange = (event: StorageEvent) => {
    if (!event.key || event.key === TOKEN_KEY || event.key === USER_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("focus", handleAuthChange);
  document.addEventListener("visibilitychange", handleAuthChange);
  channel?.addEventListener("message", handleAuthChange);

  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChange);
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("focus", handleAuthChange);
    document.removeEventListener("visibilitychange", handleAuthChange);
    channel?.removeEventListener("message", handleAuthChange);
    channel?.close();
  };
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChanged();
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  notifyAuthChanged();
}

export function setStoredUser(user: User) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChanged();
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
