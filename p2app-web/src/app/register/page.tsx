"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register as registerUser } from "@/features/auth/auth-service";
import { getApiErrorMessage } from "@/lib/api";
import { registerSchema, type RegisterFormData } from "@/schemas/auth";

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: RegisterFormData) =>
      registerUser({
        nome: payload.nome,
        email: payload.email,
        senha: payload.senha,
      }),
    onSuccess: () => {
      toast.success("Conta criada com sucesso. Faca login para continuar.");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Nao foi possivel criar sua conta."));
    },
  });

  return (
    <AuthShell title="Criar conta" description="O cadastro publico cria automaticamente um usuario cliente.">
      <form className="space-y-4" onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" placeholder="Cliente Teste" autoComplete="name" {...form.register("nome")} />
          {form.formState.errors.nome ? <p className="text-sm text-red-500">{form.formState.errors.nome.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="cliente@example.com" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email ? <p className="text-sm text-red-500">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" type="password" autoComplete="new-password" {...form.register("senha")} />
            {form.formState.errors.senha ? <p className="text-sm text-red-500">{form.formState.errors.senha.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmarSenha">Confirmar senha</Label>
            <Input id="confirmarSenha" type="password" autoComplete="new-password" {...form.register("confirmarSenha")} />
            {form.formState.errors.confirmarSenha ? (
              <p className="text-sm text-red-500">{form.formState.errors.confirmarSenha.message}</p>
            ) : null}
          </div>
        </div>
        <Button type="submit" className="h-9 w-full bg-yellow-400 text-slate-950 hover:bg-yellow-300" disabled={mutation.isPending}>
          {mutation.isPending ? "Criando..." : "Criar conta"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Ja tem conta?{" "}
        <Link href="/login" className="font-medium text-yellow-600 dark:text-yellow-300">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
