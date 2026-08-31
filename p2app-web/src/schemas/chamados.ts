import { z } from "zod";

export const ticketPrioritySchema = z.enum(["low", "medium", "high", "critical"]);
export const ticketStatusSchema = z.enum(["open", "in_progress", "resolved", "closed"]);
export const atendimentoStatusSchema = z.enum(["planejado", "em_andamento", "concluido", "cancelado"]);

export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Título deve ter pelo menos 2 caracteres.")
    .max(150, "Título deve ter no máximo 150 caracteres."),
  description: z.string().trim().min(1, "Descrição obrigatória."),
  priority: ticketPrioritySchema,
  category: z
    .string()
    .trim()
    .max(80, "Categoria deve ter no máximo 80 caracteres.")
    .optional(),
  assigned_to_id: z.number().nullable().optional(),
});

export const updateTicketSchema = createTicketSchema.extend({
  status: ticketStatusSchema,
});

export const ticketEventSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Comentário obrigatório.")
    .max(1000, "Comentário deve ter no máximo 1000 caracteres."),
});

export const atendimentoCreateSchema = z.object({
  descricao: z
    .string()
    .trim()
    .min(2, "Descrição deve ter pelo menos 2 caracteres.")
    .max(2000, "Descrição deve ter no máximo 2000 caracteres."),
  status: atendimentoStatusSchema,
});

export const atendimentoUpdateSchema = z.object({
  descricao: z
    .string()
    .trim()
    .min(2, "Descrição deve ter pelo menos 2 caracteres.")
    .max(2000, "Descrição deve ter no máximo 2000 caracteres.")
    .optional(),
  status: atendimentoStatusSchema.optional(),
});

export type CreateTicketFormData = z.infer<typeof createTicketSchema>;
export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>;
export type TicketEventFormData = z.infer<typeof ticketEventSchema>;
export type AtendimentoCreateFormData = z.infer<typeof atendimentoCreateSchema>;
export type AtendimentoUpdateFormData = z.infer<typeof atendimentoUpdateSchema>;
