import type { Ticket, TicketPriority, TicketStatus } from "@/types/api";

const activeStatuses = new Set<TicketStatus>(["open", "in_progress"]);
const doneStatuses = new Set<TicketStatus>(["resolved", "closed"]);
const priorityWeight: Record<TicketPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export function getTicketMetrics(tickets: Ticket[], total = tickets.length) {
  const active = tickets.filter((ticket) => activeStatuses.has(ticket.status));
  const done = tickets.filter((ticket) => doneStatuses.has(ticket.status));
  const critical = tickets.filter((ticket) => ticket.priority === "critical");
  const unassigned = tickets.filter((ticket) => !ticket.assigned_to_id && activeStatuses.has(ticket.status));
  const resolutionRate = total > 0 ? Math.round((done.length / total) * 100) : 0;

  return {
    total,
    active: active.length,
    done: done.length,
    critical: critical.length,
    unassigned: unassigned.length,
    resolutionRate,
  };
}

export function getPriorityQueue(tickets: Ticket[]) {
  return [...tickets]
    .filter((ticket) => activeStatuses.has(ticket.status))
    .sort((current, next) => {
      const priorityDelta = priorityWeight[next.priority] - priorityWeight[current.priority];
      if (priorityDelta !== 0) return priorityDelta;
      return new Date(current.created_at).getTime() - new Date(next.created_at).getTime();
    });
}

export function getStatusCounts(tickets: Ticket[]) {
  return tickets.reduce<Record<TicketStatus, number>>(
    (acc, ticket) => {
      acc[ticket.status] += 1;
      return acc;
    },
    {
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    },
  );
}

export function getTicketAgeInHours(ticket: Ticket) {
  const createdAt = new Date(ticket.created_at).getTime();
  const updatedAt = new Date(ticket.updated_at).getTime();
  const end = doneStatuses.has(ticket.status) ? updatedAt : Date.now();
  return Math.max(0, Math.round((end - createdAt) / 36e5));
}

export function getOperationalRisk(ticket: Ticket) {
  if (ticket.priority === "critical" && ticket.status === "open") return "Risco alto";
  if (ticket.priority === "high" && !ticket.assigned_to_id) return "Aguardando responsavel";
  if (ticket.status === "in_progress") return "Em execucao";
  if (doneStatuses.has(ticket.status)) return "Finalizado";
  return "Na fila";
}
