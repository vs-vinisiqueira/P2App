"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMe, login } from "@/features/auth/auth-service";
import { getApiErrorMessage } from "@/lib/api";
import { setStoredUser, setToken } from "@/lib/auth";
import { loginSchema, type LoginFormData } from "@/schemas/auth";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: LoginFormData) => {
      const token = await login(payload);
      setToken(token.access_token);
      const user = await getMe();
      setStoredUser(user);
      return user;
    },
    onSuccess: () => {
      toast.success("Login realizado com sucesso.");
      router.push(nextPath);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Nao foi possivel entrar. Verifique e-mail e senha."));
    },
  });

  return (
    <AuthShell title="Entrar" description="Acesse sua area de chamados com seu e-mail e senha.">
      <form method="post" className="space-y-4" onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="cliente@example.com" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email ? <p className="text-sm text-red-500">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" type="password" placeholder="Sua senha" autoComplete="current-password" {...form.register("senha")} />
          {form.formState.errors.senha ? <p className="text-sm text-red-500">{form.formState.errors.senha.message}</p> : null}
        </div>
        <Button type="submit" className="h-9 w-full bg-yellow-400 text-slate-950 hover:bg-yellow-300" disabled={mutation.isPending}>
          {mutation.isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Ainda nao tem conta?{" "}
        <Link href="/register" className="font-medium text-yellow-600 dark:text-yellow-300">
          Criar conta
        </Link>
      </p>
    </AuthShell>
  );
}
