"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, CalendarClock, CheckCircle2, Hash, MessageSquare, Plus, Send, Trash2, UserCheck } from "lucide-react";
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
import { atendimentoStatusLabels, atendimentoStatusStyles } from "@/features/atendimentos/atendimentos-format";
import { createAtendimento, listAtendimentos, updateAtendimento } from "@/features/atendimentos/atendimentos-service";
import { listUsers } from "@/features/users/users-service";
import { useAuthToken } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api";
import { getStoredUser, isSupportUser } from "@/lib/auth";
import { atendimentoCreateSchema, ticketEventSchema, updateTicketSchema, type AtendimentoCreateFormData, type TicketEventFormData, type UpdateTicketFormData } from "@/schemas/chamados";
import type { Atendimento, TicketEvent } from "@/types/api";

export default function ChamadoDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthToken();
  const ticketId = Number(params.id);
  const user = getStoredUser();
  const canEditRestrictedFields = isSupportUser(user);
  const [atendimentoModalOpen, setAtendimentoModalOpen] = useState(false);

  const ticketQuery = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicket(ticketId),
    enabled: isAuthenticated && Number.isFinite(ticketId),
  });
  const eventsQuery = useQuery({
    queryKey: ["ticket", ticketId, "events"],
    queryFn: () => listTicketEvents(ticketId),
    enabled: isAuthenticated && Number.isFinite(ticketId),
  });
  const atendimentosQuery = useQuery({
    queryKey: ["ticket", ticketId, "atendimentos"],
    queryFn: () => listAtendimentos(ticketId),
    enabled: isAuthenticated && Number.isFinite(ticketId),
  });
  const tecnicosQuery = useQuery({
    queryKey: ["users", "tecnicos"],
    queryFn: () => listUsers("tecnico"),
    enabled: isAuthenticated && canEditRestrictedFields,
  });

  const form = useForm<UpdateTicketFormData>({
    resolver: zodResolver(updateTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "open",
      category: "",
      assigned_to_id: null,
    },
  });
  const selectedPriority = useWatch({ control: form.control, name: "priority" });
  const selectedStatus = useWatch({ control: form.control, name: "status" });
  const selectedAssignee = useWatch({ control: form.control, name: "assigned_to_id" });

  const commentForm = useForm<TicketEventFormData>({
    resolver: zodResolver(ticketEventSchema),
    defaultValues: { message: "" },
  });
  const atendimentoForm = useForm<AtendimentoCreateFormData>({
    resolver: zodResolver(atendimentoCreateSchema),
    defaultValues: { descricao: "", status: "em_andamento" },
  });

  useEffect(() => {
    if (ticketQuery.data) {
      form.reset({
        title: ticketQuery.data.title,
        description: ticketQuery.data.description,
        priority: ticketQuery.data.priority,
        status: ticketQuery.data.status,
        category: ticketQuery.data.category ?? "",
        assigned_to_id: ticketQuery.data.assigned_to_id ?? null,
      });
    }
  }, [form, ticketQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateTicketFormData) => {
      const sanitizedPayload = {
        ...payload,
        category: payload.category?.trim() || null,
      };
      const nextPayload = canEditRestrictedFields
        ? sanitizedPayload
        : { ...sanitizedPayload, status: undefined, assigned_to_id: undefined };
      return updateTicket(ticketId, nextPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId, "events"] });
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

  const eventMutation = useMutation({
    mutationFn: (payload: TicketEventFormData) => createTicketEvent(ticketId, payload),
    onSuccess: () => {
      commentForm.reset();
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId, "events"] });
      toast.success("Comentário registrado.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível registrar o comentário."));
    },
  });

  const createAtendimentoMutation = useMutation({
    mutationFn: (payload: AtendimentoCreateFormData) => createAtendimento(ticketId, payload),
    onSuccess: () => {
      atendimentoForm.reset({ descricao: "", status: "em_andamento" });
      setAtendimentoModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId, "atendimentos"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId, "events"] });
      toast.success("Atendimento registrado.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível registrar o atendimento."));
    },
  });

  const concludeAtendimentoMutation = useMutation({
    mutationFn: (atendimentoId: number) =>
      updateAtendimento(ticketId, atendimentoId, { status: "concluido" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId, "atendimentos"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId, "events"] });
      toast.success("Atendimento concluído.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível concluir o atendimento."));
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
          <CardContent className="p-6 text-red-700 dark:text-red-200">Não foi possível carregar este chamado.</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Hero banner */}
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
                <h2 className="break-words text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{ticket.title}</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Chamado #{ticket.id} atualizado em {formatDate(ticket.updated_at)}</p>
              </div>
              <div className="grid min-w-0 gap-3 sm:grid-cols-3 lg:w-[520px]">
                <HeroFact icon={Activity} label="Risco" value={getOperationalRisk(ticket)} />
                <HeroFact icon={CalendarClock} label="Idade" value={`${getTicketAgeInHours(ticket)}h`} />
                <HeroFact icon={UserCheck} label="Responsável" value={ticket.assigned_to_id ? `#${ticket.assigned_to_id}` : "Livre"} />
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            {/* Main form */}
            <div className="space-y-6">
              <Card className="border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1B2B]">
                <CardHeader>
                  <CardTitle>Dados do chamado</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-5" onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}>
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input id="title" {...form.register("title")} />
                      {form.formState.errors.title ? <p className="text-sm text-red-500">{form.formState.errors.title.message}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea id="description" rows={7} {...form.register("description")} />
                      {form.formState.errors.description ? <p className="text-sm text-red-500">{form.formState.errors.description.message}</p> : null}
                    </div>
                    <div className="grid min-w-0 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select value={selectedPriority} onValueChange={(value) => form.setValue("priority", value as UpdateTicketFormData["priority"])}>
                          <SelectTrigger id="priority" className="h-9 w-full">
                            <span className="min-w-0 truncate">{selectedPriority ? priorityLabels[selectedPriority] : "Prioridade"}</span>
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
                            <span className="min-w-0 truncate">{selectedStatus ? statusLabels[selectedStatus] : "Status"}</span>
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

                    {/* Técnico responsável — só para suporte/admin */}
                    {canEditRestrictedFields ? (
                      <div className="space-y-2">
                        <Label htmlFor="assigned_to_id">Técnico responsável</Label>
                        <Select
                          value={selectedAssignee != null ? String(selectedAssignee) : "none"}
                          onValueChange={(v) =>
                            form.setValue("assigned_to_id", v === "none" ? null : Number(v))
                          }
                        >
                          <SelectTrigger id="assigned_to_id" className="h-9 w-full">
                            <span className="min-w-0 truncate">
                              {selectedAssignee != null
                                ? (tecnicosQuery.data?.find((t) => t.id === selectedAssignee)?.nome ?? `Técnico #${selectedAssignee}`)
                                : "Nenhum (sem atribuição)"}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum (sem atribuição)</SelectItem>
                            {tecnicosQuery.data?.map((t) => (
                              <SelectItem key={t.id} value={String(t.id)}>
                                {t.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
                        Status e responsável são campos restritos ao suporte/admin.
                      </p>
                    )}

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                      <Dialog>
                        <DialogTrigger render={<Button type="button" variant="destructive" className="w-full sm:w-auto" />}>
                          <Trash2 className="size-4" />
                          Excluir
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Excluir chamado?</DialogTitle>
                          </DialogHeader>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Esta ação remove o chamado permanentemente.</p>
                          <DialogFooter>
                            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
                            <Button type="button" variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                              Confirmar exclusão
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button type="submit" className="w-full bg-yellow-400 text-slate-950 hover:bg-yellow-300 sm:w-auto" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Atendimentos técnicos */}
              {canEditRestrictedFields ? (
                <Card className="border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1B2B]">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Atendimentos técnicos</CardTitle>
                    <Dialog open={atendimentoModalOpen} onOpenChange={setAtendimentoModalOpen}>
                      <DialogTrigger render={<Button type="button" size="sm" className="bg-yellow-400 text-slate-950 hover:bg-yellow-300" />}>
                        <Plus className="size-4" />
                        Registrar
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Registrar atendimento</DialogTitle>
                        </DialogHeader>
                        <form
                          className="space-y-4"
                          onSubmit={atendimentoForm.handleSubmit((data) => createAtendimentoMutation.mutate(data))}
                        >
                          <div className="space-y-2">
                            <Label htmlFor="at-descricao">Descrição do atendimento</Label>
                            <Textarea
                              id="at-descricao"
                              rows={5}
                              placeholder="Descreva o que foi feito neste atendimento..."
                              {...atendimentoForm.register("descricao")}
                            />
                            {atendimentoForm.formState.errors.descricao ? (
                              <p className="text-sm text-red-500">{atendimentoForm.formState.errors.descricao.message}</p>
                            ) : null}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="at-status">Status inicial</Label>
                            <Select
                              value={atendimentoForm.watch("status")}
                              onValueChange={(v) => atendimentoForm.setValue("status", v as AtendimentoCreateFormData["status"])}
                            >
                              <SelectTrigger id="at-status" className="h-9 w-full">
                                <span>{atendimentoStatusLabels[atendimentoForm.watch("status")]}</span>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planejado">Planejado</SelectItem>
                                <SelectItem value="em_andamento">Em andamento</SelectItem>
                                <SelectItem value="concluido">Concluído</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
                            <Button
                              type="submit"
                              className="bg-yellow-400 text-slate-950 hover:bg-yellow-300"
                              disabled={createAtendimentoMutation.isPending}
                            >
                              {createAtendimentoMutation.isPending ? "Registrando..." : "Registrar"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {atendimentosQuery.isLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : atendimentosQuery.isError ? (
                      <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                        Não foi possível carregar os atendimentos.
                      </p>
                    ) : atendimentosQuery.data && atendimentosQuery.data.length > 0 ? (
                      <div className="space-y-3">
                        {atendimentosQuery.data.map((at) => (
                          <AtendimentoCard
                            key={at.id}
                            atendimento={at}
                            onConclude={() => concludeAtendimentoMutation.mutate(at.id)}
                            isConcluding={concludeAtendimentoMutation.isPending}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-5 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                        <UserCheck className="mx-auto mb-2 size-5 text-yellow-500" />
                        Nenhum atendimento registrado.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1B2B]">
                <CardHeader>
                  <CardTitle>Metadados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <InfoRow label="Criador" value={`Usuário #${ticket.owner_id}`} />
                  <InfoRow label="Responsável" value={ticket.assigned_to_id ? `Usuário #${ticket.assigned_to_id}` : "Não definido"} />
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
                      <Label htmlFor="event-message">Novo comentário</Label>
                      <Textarea id="event-message" rows={4} placeholder="Registre uma atualização para o histórico" {...commentForm.register("message")} />
                      {commentForm.formState.errors.message ? <p className="text-sm text-red-500">{commentForm.formState.errors.message.message}</p> : null}
                    </div>
                    <Button type="submit" className="w-full bg-yellow-400 text-slate-950 hover:bg-yellow-300" disabled={eventMutation.isPending}>
                      <Send className="size-4" />
                      {eventMutation.isPending ? "Registrando..." : "Adicionar comentário"}
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
                      Não foi possível carregar o histórico.
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
                      Nenhum registro no histórico.
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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
    <div className="flex min-w-0 items-center justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/5">
      <span className="shrink-0 text-slate-500 dark:text-slate-400">{label}</span>
      <span className="min-w-0 truncate font-medium">{value}</span>
    </div>
  );
}

function TimelineItem({ event, active = false }: { event: TicketEvent; active?: boolean }) {
  return (
    <div className="flex min-w-0 gap-3">
      <div className="mt-1 flex flex-col items-center">
        <div className={active ? "size-2.5 rounded-full bg-yellow-400" : "size-2.5 rounded-full bg-slate-300 dark:bg-slate-600"} />
        <div className="mt-1 h-full min-h-8 w-px bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{formatEventTitle(event)}</p>
        {event.message ? <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">{event.message}</p> : null}
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Usuário #{event.actor_id} em {formatDate(event.created_at)}
        </p>
      </div>
    </div>
  );
}

function AtendimentoCard({
  atendimento,
  onConclude,
  isConcluding,
}: {
  atendimento: Atendimento;
  onConclude: () => void;
  isConcluding: boolean;
}) {
  const isConcluded = atendimento.status === "concluido" || atendimento.status === "cancelado";
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${atendimentoStatusStyles[atendimento.status]}`}>
          {atendimentoStatusLabels[atendimento.status]}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">Técnico #{atendimento.tecnico_id}</span>
      </div>
      <p className="break-words text-sm text-slate-700 dark:text-slate-300">{atendimento.descricao}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400">{formatDate(atendimento.data_inicio)}</span>
        {!isConcluded ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 text-xs"
            onClick={onConclude}
            disabled={isConcluding}
          >
            <CheckCircle2 className="size-3.5" />
            Concluir
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function formatEventTitle(event: TicketEvent) {
  if (event.event_type === "comment") return "Comentário";
  if (event.event_type === "assignment_changed") return "Responsável atualizado";

  const oldStatus = event.old_value && event.old_value in statusLabels ? statusLabels[event.old_value as keyof typeof statusLabels] : event.old_value;
  const newStatus = event.new_value && event.new_value in statusLabels ? statusLabels[event.new_value as keyof typeof statusLabels] : event.new_value;
  return `Status: ${oldStatus ?? "-"} → ${newStatus ?? "-"}`;
}
