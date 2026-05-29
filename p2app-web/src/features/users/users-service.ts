import { api } from "@/lib/api";
import type { User } from "@/types/api";

export async function listUsers() {
  const { data } = await api.get<User[]>("/users/");
  return data;
}
