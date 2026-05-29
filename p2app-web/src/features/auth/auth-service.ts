import { api } from "@/lib/api";
import type { LoginRequest, TokenResponse, User } from "@/types/api";

export type RegisterRequest = {
  nome: string;
  email: string;
  senha: string;
};

export async function login(payload: LoginRequest) {
  const { data } = await api.post<TokenResponse>("/auth/login", payload);
  return data;
}

export async function register(payload: RegisterRequest) {
  const { data } = await api.post<User>("/users/", payload);
  return data;
}

export async function getMe() {
  const { data } = await api.get<User>("/auth/me");
  return data;
}
