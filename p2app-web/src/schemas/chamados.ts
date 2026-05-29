import { z } from "zod";

export const ticketPrioritySchema = z.enum(["low", "medium", "high", "critical"]);
export const ticketStatusSchema = z.enum(["open", "in_progress", "resolved", "closed"]);

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
});

export const updateTicketSchema = createTicketSchema.extend({
  status: ticketStatusSchema,
});

export type CreateTicketFormData = z.infer<typeof createTicketSchema>;
export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>;
