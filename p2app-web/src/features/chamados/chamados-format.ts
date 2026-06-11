import { AlertCircle, CheckCircle, Clock, ShieldCheck } from "lucide-react";

import type { TicketPriority, TicketStatus } from "@/types/api";

export const statusLabels: Record<TicketStatus, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  closed: "Fechado",
};

export const priorityLabels: Record<TicketPriority, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
  critical: "Critica",
};

export const statusStyles: Record<TicketStatus, string> = {
  open: "border-yellow-400/40 bg-yellow-400/10 text-yellow-700 dark:text-yellow-300",
  in_progress: "border-blue-400/40 bg-blue-400/10 text-blue-700 dark:text-blue-300",
  resolved: "border-emerald-400/40 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300",
  closed: "border-slate-400/40 bg-slate-400/10 text-slate-700 dark:text-slate-300",
};

export const priorityStyles: Record<TicketPriority, string> = {
  low: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  medium: "border-yellow-300 bg-yellow-100 text-yellow-800 dark:border-yellow-500/50 dark:bg-yellow-500/15 dark:text-yellow-200",
  high: "border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-500/50 dark:bg-orange-500/15 dark:text-orange-200",
  critical: "border-red-300 bg-red-100 text-red-800 dark:border-red-500/50 dark:bg-red-500/15 dark:text-red-200",
};

export const statusIcons = {
  open: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle,
  closed: ShieldCheck,
} satisfies Record<TicketStatus, typeof AlertCircle>;

export function formatDate(value?: string) {
  if (!value) return "Nao informado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
