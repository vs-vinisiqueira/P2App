import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("E-mail inválido."),
  senha: z.string().min(1, "Senha obrigatória.").max(72, "Senha deve ter no máximo 72 caracteres."),
});

export const registerSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, "Nome deve ter pelo menos 2 caracteres.")
      .max(120, "Nome deve ter no máximo 120 caracteres."),
    email: z.email("E-mail inválido."),
    senha: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres.")
      .max(72, "Senha deve ter no máximo 72 caracteres."),
    confirmarSenha: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não conferem.",
    path: ["confirmarSenha"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
