"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, CalendarClock, Hash, MessageSquare, Send, Trash2, UserCheck } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getOperationalRisk, getTicketAgeInHours } from "@/features/chamados/chamados-analytics";
import { formatDate, priorityLabels, statusLabels } from "@/features/chamados/chamados-format";
import { createTicketEvent, deleteTicket, getTicket, listTicketEvents, updateTicket } from "@/features/chamados/chamados-service";
import { getApiErrorMessage } from "@/lib/api";
import { getStoredUser, isSupportUser } from "@/lib/auth";
import { ticketEventSchema, updateTicketSchema, type TicketEventFormData, type UpdateTicketFormData } from "@/schemas/chamados";
import type { TicketEvent } from "@/types/api";

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
  const eventsQuery = useQuery({
    queryKey: ["ticket", ticketId, "events"],
    queryFn: () => listTicketEvents(ticketId),
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
  const commentForm = useForm<TicketEventFormData>({
    resolver: zodResolver(ticketEventSchema),
    defaultValues: {
      message: "",
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId, "events"] });
      toast.success("Chamado atualizado.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Nao foi possivel atualizar o chamado."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Chamado excluido.");
      router.push("/chamados");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Nao foi possivel excluir o chamado."));
    },
  });

  const eventMutation = useMutation({
    mutationFn: (payload: TicketEventFormData) => createTicketEvent(ticketId, payload),
    onSuccess: () => {
      commentForm.reset();
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId, "events"] });
      toast.success("Comentario registrado.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Nao foi possivel registrar o comentario."));
    },
  });

  const ticket = ticketQuery.data;

  return (
    <AppShell>
      {ticketQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : ticketQuery.isError || !ticket ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
          <CardContent className="p-6 text-red-700 dark:text-red-200">Nao foi possivel carregar este chamado.</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#091827]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap gap-2">
                  <TicketStatusBadge status={ticket.status} />
                  <TicketPriorityBadge priority={ticket.priority} />
                  {ticket.category ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                      {ticket.category}
                    </span>
                  ) : null}
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{ticket.title}</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Chamado #{ticket.id}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
                <HeroFact icon={Activity} label="Risco" value={getOperationalRisk(ticket)} />
                <HeroFact icon={CalendarClock} label="Idade" value={`${getTicketAgeInHours(ticket)}h`} />
                <HeroFact icon={UserCheck} label="Responsavel" value={ticket.assigned_to_id ? `#${ticket.assigned_to_id}` : "Livre"} />
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <Card className="border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1B2B]">
              <CardHeader>
                <CardTitle>Dados do chamado</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}>
                  <div className="space-y-2">
                    <Label htmlFor="title">Titulo</Label>
                    <Input id="title" {...form.register("title")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descricao</Label>
                    <Textarea id="description" rows={7} {...form.register("description")} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select value={selectedPriority} onValueChange={(value) => form.setValue("priority", value as UpdateTicketFormData["priority"])}>
                        <SelectTrigger id="priority" className="h-9 w-full">
                          <span>{selectedPriority ? priorityLabels[selectedPriority] : "Prioridade"}</span>
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
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={selectedStatus}
                        onValueChange={(value) => form.setValue("status", value as UpdateTicketFormData["status"])}
                        disabled={!canEditRestrictedFields}
                      >
                        <SelectTrigger id="status" className="h-9 w-full">
                          <span>{selectedStatus ? statusLabels[selectedStatus] : "Status"}</span>
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
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
                      Status e responsavel sao campos restritos ao suporte/admin.
                    </p>
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
                        <p className="text-sm text-slate-500 dark:text-slate-400">Esta acao remove o chamado permanentemente.</p>
                        <DialogFooter>
                          <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
                          <Button type="button" variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                            Confirmar exclusao
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button type="submit" className="bg-yellow-400 text-slate-950 hover:bg-yellow-300" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? "Salvando..." : "Salvar alteracoes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1B2B]">
                <CardHeader>
                  <CardTitle>Metadados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <InfoRow label="Criador" value={`Usuario #${ticket.owner_id}`} />
                  <InfoRow label="Responsavel" value={ticket.assigned_to_id ? `Usuario #${ticket.assigned_to_id}` : "Nao definido"} />
                  <InfoRow label="Criado em" value={formatDate(ticket.created_at)} />
                  <InfoRow label="Atualizado em" value={formatDate(ticket.updated_at)} />
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1B2B]">
                <CardHeader>
                  <CardTitle>Linha do tempo</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="mb-5 space-y-3" onSubmit={commentForm.handleSubmit((data) => eventMutation.mutate(data))}>
                    <div className="space-y-2">
                      <Label htmlFor="event-message">Novo comentario</Label>
                      <Textarea id="event-message" rows={4} placeholder="Registre uma atualizacao para o historico" {...commentForm.register("message")} />
                      {commentForm.formState.errors.message ? <p className="text-sm text-red-500">{commentForm.formState.errors.message.message}</p> : null}
                    </div>
                    <Button type="submit" className="w-full bg-yellow-400 text-slate-950 hover:bg-yellow-300" disabled={eventMutation.isPending}>
                      <Send className="size-4" />
                      {eventMutation.isPending ? "Registrando..." : "Adicionar comentario"}
                    </Button>
                  </form>

                  {eventsQuery.isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : eventsQuery.isError ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                      Nao foi possivel carregar o historico.
                    </p>
                  ) : eventsQuery.data && eventsQuery.data.length > 0 ? (
                    <div className="space-y-4">
                      {eventsQuery.data.map((event) => (
                        <TimelineItem key={event.id} event={event} active={event.id === eventsQuery.data.at(-1)?.id} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-5 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                      <MessageSquare className="mx-auto mb-2 size-5 text-yellow-500" />
                      Nenhum registro no historico.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function HeroFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
        <Icon className="size-4 text-yellow-600 dark:text-yellow-300" />
        {label}
      </div>
      <p className="mt-2 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/5">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}

function TimelineItem({ event, active = false }: { event: TicketEvent; active?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex flex-col items-center">
        <div className={active ? "size-2.5 rounded-full bg-yellow-400" : "size-2.5 rounded-full bg-slate-300 dark:bg-slate-600"} />
        <div className="mt-1 h-full min-h-8 w-px bg-slate-200 dark:bg-white/10" />
      </div>
      <div>
        <p className="text-sm font-medium">{formatEventTitle(event)}</p>
        {event.message ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{event.message}</p> : null}
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Usuario #{event.actor_id} em {formatDate(event.created_at)}
        </p>
      </div>
    </div>
  );
}

function formatEventTitle(event: TicketEvent) {
  if (event.event_type === "comment") return "Comentario";
  if (event.event_type === "assignment_changed") return "Responsavel atualizado";

  const oldStatus = event.old_value && event.old_value in statusLabels ? statusLabels[event.old_value as keyof typeof statusLabels] : event.old_value;
  const newStatus = event.new_value && event.new_value in statusLabels ? statusLabels[event.new_value as keyof typeof statusLabels] : event.new_value;
  return `Status: ${oldStatus ?? "-"} -> ${newStatus ?? "-"}`;
}
