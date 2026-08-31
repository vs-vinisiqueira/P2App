import { api } from "@/lib/api";
import type { User, UserType } from "@/types/api";

export async function listUsers(tipoUsuario?: UserType | string) {
  const { data } = await api.get<User[]>("/users/", {
    params: tipoUsuario ? { tipo_usuario: tipoUsuario } : undefined,
  });
  return data;
}
