import { api } from "@/lib/api";
import type {
  Ticket,
  TicketCreateRequest,
  TicketEvent,
  TicketEventCreateRequest,
  TicketListResponse,
  TicketUpdateRequest,
} from "@/types/api";

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

export async function listTicketEvents(ticketId: number) {
  const { data } = await api.get<TicketEvent[]>(`/tickets/${ticketId}/events`);
  return data;
}

export async function createTicketEvent(ticketId: number, payload: TicketEventCreateRequest) {
  const { data } = await api.post<TicketEvent>(`/tickets/${ticketId}/events`, payload);
  return data;
}
