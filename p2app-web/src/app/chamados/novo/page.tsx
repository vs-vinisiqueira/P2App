"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTicket } from "@/features/chamados/chamados-service";
import { getApiErrorMessage } from "@/lib/api";
import { createTicketSchema, type CreateTicketFormData } from "@/schemas/chamados";

export default function NovoChamadoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category: "",
    },
  });
  const selectedPriority = useWatch({ control: form.control, name: "priority" });

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Chamado criado com sucesso.");
      router.push(`/chamados/${ticket.id}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível criar o chamado."));
    },
  });

  return (
    <AppShell>
      <Card className="mx-auto max-w-3xl border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B1B2B]">
        <CardHeader>
          <CardTitle>Novo chamado</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit((data) =>
              mutation.mutate({
                ...data,
                category: data.category?.trim() || undefined,
              }),
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" placeholder="Notebook sem rede" {...form.register("title")} />
              {form.formState.errors.title ? <p className="text-sm text-red-500">{form.formState.errors.title.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" rows={6} placeholder="Descreva o problema técnico" {...form.register("description")} />
              {form.formState.errors.description ? <p className="text-sm text-red-500">{form.formState.errors.description.message}</p> : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={selectedPriority} onValueChange={(value) => form.setValue("priority", value as CreateTicketFormData["priority"])}>
                  <SelectTrigger id="priority" className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input id="category" placeholder="infra" {...form.register("category")} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push("/chamados")}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-yellow-400 text-slate-950 hover:bg-yellow-300" disabled={mutation.isPending}>
                {mutation.isPending ? "Criando..." : "Criar chamado"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
