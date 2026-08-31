import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

import type { AtendimentoStatus } from "@/types/api";

export const atendimentoStatusLabels: Record<AtendimentoStatus, string> = {
  planejado: "Planejado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const atendimentoStatusStyles: Record<AtendimentoStatus, string> = {
  planejado: "border-purple-400/40 bg-purple-400/10 text-purple-700 dark:text-purple-300",
  em_andamento: "border-blue-400/40 bg-blue-400/10 text-blue-700 dark:text-blue-300",
  concluido: "border-emerald-400/40 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300",
  cancelado: "border-slate-400/40 bg-slate-400/10 text-slate-700 dark:text-slate-300",
};

export const atendimentoStatusIcons = {
  planejado: Clock,
  em_andamento: AlertCircle,
  concluido: CheckCircle,
  cancelado: XCircle,
} satisfies Record<AtendimentoStatus, typeof AlertCircle>;
