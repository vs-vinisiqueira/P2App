"use client";

import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { deleteTicket, getTicket, updateTicket } from "@/features/chamados/chamados-service";
import { formatDate } from "@/features/chamados/chamados-format";
import { getApiErrorMessage } from "@/lib/api";
import { getStoredUser, isSupportUser } from "@/lib/auth";
import { updateTicketSchema, type UpdateTicketFormData } from "@/schemas/chamados";

export default function ChamadoDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const ticketId = Number(params.id);
  const user = getStoredUser();
  const canEditRestrictedFields = isSupportUser(user);

  const ticketQuery = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicket(ticketId),
    enabled: Number.isFinite(ticketId),
  });

  const form = useForm<UpdateTicketFormData>({
    resolver: zodResolver(updateTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "open",
      category: "",
    },
  });
  const selectedPriority = useWatch({ control: form.control, name: "priority" });
  const selectedStatus = useWatch({ control: form.control, name: "status" });

  useEffect(() => {
    if (ticketQuery.data) {
      form.reset({
        title: ticketQuery.data.title,
        description: ticketQuery.data.description,
        priority: ticketQuery.data.priority,
        status: ticketQuery.data.status,
        category: ticketQuery.data.category ?? "",
      });
    }
  }, [form, ticketQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateTicketFormData) => {
      const sanitizedPayload = {
        ...payload,
        category: payload.category?.trim() || null,
      };
      const nextPayload = canEditRestrictedFields ? sanitizedPayload : { ...sanitizedPayload, status: undefined };
      return updateTicket(ticketId, nextPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      toast.success("Chamado atualizado.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o chamado."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Chamado excluído.");
      router.push("/chamados");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir o chamado."));
    },
  });

  return (
    <AppShell>
      {ticketQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : ticketQuery.isError || !ticketQuery.data ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
          <CardContent className="p-6 text-red-700 dark:text-red-200">Não foi possível carregar este chamado.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <Card className="border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B1B2B]">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{ticketQuery.data.title}</CardTitle>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Chamado #{ticketQuery.data.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TicketStatusBadge status={ticketQuery.data.status} />
                  <TicketPriorityBadge priority={ticketQuery.data.priority} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}>
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" {...form.register("title")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" rows={7} {...form.register("description")} />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={selectedPriority} onValueChange={(value) => form.setValue("priority", value as UpdateTicketFormData["priority"])}>
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
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={(value) => form.setValue("status", value as UpdateTicketFormData["status"])}
                      disabled={!canEditRestrictedFields}
                    >
                      <SelectTrigger id="status" className="h-9 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Aberto</SelectItem>
                        <SelectItem value="in_progress">Em andamento</SelectItem>
                        <SelectItem value="resolved">Resolvido</SelectItem>
                        <SelectItem value="closed">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input id="category" {...form.register("category")} />
                  </div>
                </div>
                {!canEditRestrictedFields ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Seu perfil pode editar dados principais, mas status e responsável são restritos ao suporte/admin.</p>
                ) : null}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Dialog>
                    <DialogTrigger render={<Button type="button" variant="destructive" />}>
                      <Trash2 className="size-4" />
                      Excluir
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Excluir chamado?</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Esta ação remove o chamado usando o endpoint real <code>DELETE /tickets/{"{ticket_id}"}</code>.
                      </p>
                      <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
                        <Button type="button" variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                          Confirmar exclusão
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button type="submit" className="bg-yellow-400 text-slate-950 hover:bg-yellow-300" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="h-fit border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B1B2B]">
            <CardHeader>
              <CardTitle>Metadados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoRow label="Criador" value={`Usuário #${ticketQuery.data.owner_id}`} />
              <InfoRow label="Responsável" value={ticketQuery.data.assigned_to_id ? `Usuário #${ticketQuery.data.assigned_to_id}` : "Não definido"} />
              <InfoRow label="Criado em" value={formatDate(ticketQuery.data.created_at)} />
              <InfoRow label="Atualizado em" value={formatDate(ticketQuery.data.updated_at)} />
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/5">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
