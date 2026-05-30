export type UserRole = "admin" | "user";
export type UserType = "admin" | "gerente" | "tecnico" | "cliente";

export type User = {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: UserType;
  role: UserRole;
};

export type LoginRequest = {
  email: string;
  senha: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: "bearer";
};

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketEventType = "comment" | "status_changed" | "assignment_changed";

export type Ticket = {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  owner_id: number;
  assigned_to_id: number | null;
  created_at: string;
  updated_at: string;
};

export type TicketListResponse = {
  items: Ticket[];
  total: number;
  limit: number;
  offset: number;
};

export type TicketCreateRequest = {
  title: string;
  description: string;
  priority?: TicketPriority;
  category?: string | null;
};

export type TicketUpdateRequest = Partial<{
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  assigned_to_id: number | null;
}>;

export type TicketEvent = {
  id: number;
  ticket_id: number;
  actor_id: number;
  event_type: TicketEventType;
  message: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
};

export type TicketEventCreateRequest = {
  message: string;
};
