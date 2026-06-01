"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ClipboardList, Tag } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { priorityLabels } from "@/features/chamados/chamados-format";
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
      toast.error(getApiErrorMessage(error, "Nao foi possivel criar o chamado."));
    },
  });

  return (
    <AppShell>
      <div className="mx-auto grid min-w-0 max-w-6xl gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1B2B]">
          <CardHeader>
            <p className="text-sm text-slate-500 dark:text-slate-400">Abertura de atendimento</p>
            <CardTitle className="text-2xl">Novo chamado</CardTitle>
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
                <Label htmlFor="title">Titulo</Label>
                <Input id="title" placeholder="Notebook sem rede" {...form.register("title")} />
                {form.formState.errors.title ? <p className="text-sm text-red-500">{form.formState.errors.title.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descricao</Label>
                <Textarea id="description" rows={7} placeholder="Descreva o problema tecnico" {...form.register("description")} />
                {form.formState.errors.description ? <p className="text-sm text-red-500">{form.formState.errors.description.message}</p> : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={selectedPriority} onValueChange={(value) => form.setValue("priority", value as CreateTicketFormData["priority"])}>
                    <SelectTrigger id="priority" className="h-9 w-full">
                      <span className="min-w-0 truncate">{selectedPriority ? priorityLabels[selectedPriority] : "Prioridade"}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Critica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" placeholder="infra" {...form.register("category")} />
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/chamados")}>
                  Cancelar
                </Button>
                <Button type="submit" className="w-full bg-yellow-400 text-slate-950 hover:bg-yellow-300 sm:w-auto" disabled={mutation.isPending}>
                  {mutation.isPending ? "Criando..." : "Criar chamado"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <SideCard icon={ClipboardList} title="Registro" text="Titulo, descricao e categoria alimentam a fila operacional." />
          <SideCard icon={AlertTriangle} title="Prioridade" text="Critica e alta entram com destaque nas visoes de triagem." />
          <SideCard icon={Tag} title="Categoria" text="A categorizacao deixa busca e acompanhamento mais claros." />
        </aside>
      </div>
    </AppShell>
  );
}

function SideCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ClipboardList;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1B2B]">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-yellow-400/15 text-yellow-700 dark:text-yellow-300">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
        </div>
      </div>
    </div>
  );
}
