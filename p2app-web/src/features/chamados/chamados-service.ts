import { api } from "@/lib/api";
import type { Ticket, TicketCreateRequest, TicketListResponse, TicketUpdateRequest } from "@/types/api";

export async function listTickets() {
  const { data } = await api.get<TicketListResponse>("/tickets");
  return data;
}

export async function getTicket(ticketId: number) {
  const { data } = await api.get<Ticket>(`/tickets/${ticketId}`);
  return data;
}

export async function createTicket(payload: TicketCreateRequest) {
  const { data } = await api.post<Ticket>("/tickets", payload);
  return data;
}

export async function updateTicket(ticketId: number, payload: TicketUpdateRequest) {
  const { data } = await api.patch<Ticket>(`/tickets/${ticketId}`, payload);
  return data;
}

export async function deleteTicket(ticketId: number) {
  await api.delete(`/tickets/${ticketId}`);
}
