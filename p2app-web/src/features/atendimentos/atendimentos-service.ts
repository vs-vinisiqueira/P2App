import { api } from "@/lib/api";
import type {
  Atendimento,
  AtendimentoCreateRequest,
  AtendimentoUpdateRequest,
} from "@/types/api";

export async function listAtendimentos(ticketId: number) {
  const { data } = await api.get<Atendimento[]>(`/tickets/${ticketId}/atendimentos`);
  return data;
}

export async function createAtendimento(ticketId: number, payload: AtendimentoCreateRequest) {
  const { data } = await api.post<Atendimento>(`/tickets/${ticketId}/atendimentos`, payload);
  return data;
}

export async function updateAtendimento(
  ticketId: number,
  atendimentoId: number,
  payload: AtendimentoUpdateRequest,
) {
  const { data } = await api.patch<Atendimento>(
    `/tickets/${ticketId}/atendimentos/${atendimentoId}`,
    payload,
  );
  return data;
}

export async function deleteAtendimento(ticketId: number, atendimentoId: number) {
  await api.delete(`/tickets/${ticketId}/atendimentos/${atendimentoId}`);
}
