"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Plus, Search, SlidersHorizontal, Ticket } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getOperationalRisk, getTicketAgeInHours, getTicketMetrics } from "@/features/chamados/chamados-analytics";
import { formatDate, priorityLabels, statusLabels } from "@/features/chamados/chamados-format";
import { listTickets } from "@/features/chamados/chamados-service";
import { useAuthToken } from "@/hooks/use-auth";
import type { TicketPriority, TicketStatus } from "@/types/api";

const statusOptions: Array<{ value: "all" | TicketStatus; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "open", label: "Abertos" },
  { value: "in_progress", label: "Em andamento" },
  { value: "resolved", label: "Resolvidos" },
  { value: "closed", label: "Fechados" },
];

const priorityOptions: Array<{ value: "all" | TicketPriority; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "critical", label: "Critica" },
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "low", label: "Baixa" },
];

export default function ChamadosPage() {
  const { isAuthenticated } = useAuthToken();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | TicketStatus>("all");
  const [priority, setPriority] = useState<"all" | TicketPriority>("all");
  const ticketsQuery = useQuery({ queryKey: ["tickets"], queryFn: listTickets, enabled: isAuthenticated });
  const tickets = useMemo(() => ticketsQuery.data?.items ?? [], [ticketsQuery.data?.items]);
  const metrics = getTicketMetrics(tickets, ticketsQuery.data?.total);

  const filteredTickets = useMemo(() => {
    const term = search.toLowerCase().trim();
    return tickets.filter((ticket) => {
      const matchesSearch =
        !term ||
        ticket.title.toLowerCase().includes(term) ||
        ticket.description.toLowerCase().includes(term) ||
        ticket.category?.toLowerCase().includes(term);
      const matchesStatus = status === "all" || ticket.status === status;
      const matchesPriority = priority === "all" || ticket.priority === priority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [priority, search, status, tickets]);

  return (
    <AppShell>
      <div className="space-y-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#091827]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <p className="text-sm text-slate-500 dark:text-slate-400">Consulta e triagem</p>
              <h2 className="mt-1 break-words text-2xl font-semibold tracking-tight">Chamados tecnicos</h2>
            </div>
            <Link href="/chamados/novo" className={buttonVariants({ className: "w-full bg-yellow-400 text-slate-950 hover:bg-yellow-300 sm:w-auto" })}>
              <Plus className="size-4" />
              Criar chamado
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <QueueStat label="Filtrados" value={filteredTickets.length} />
            <QueueStat label="Ativos" value={metrics.active} />
            <QueueStat label="Criticos" value={metrics.critical} />
            <QueueStat label="Conclusao" value={`${metrics.resolutionRate}%`} />
          </div>
        </section>

        <Card className="border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1B2B]">
          <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_190px_190px]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por titulo, categoria ou descricao"
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as "all" | TicketStatus)}>
              <SelectTrigger className="h-9 w-full">
                <SlidersHorizontal className="size-4 text-slate-400" />
                <span className="min-w-0 truncate">{status === "all" ? "Todos" : statusLabels[status]}</span>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={(value) => setPriority(value as "all" | TicketPriority)}>
              <SelectTrigger className="h-9 w-full">
                <AlertTriangle className="size-4 text-slate-400" />
                <span className="min-w-0 truncate">{priority === "all" ? "Todas" : priorityLabels[priority]}</span>
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {ticketsQuery.isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full" />
            ))}
          </div>
        ) : ticketsQuery.isError ? (
          <Card className="border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
            <CardContent className="p-6 text-red-700 dark:text-red-200">Nao foi possivel carregar os chamados.</CardContent>
          </Card>
        ) : filteredTickets.length === 0 ? (
          <Card className="border-dashed bg-white dark:border-white/10 dark:bg-white/5">
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <Ticket className="size-10 text-yellow-500" />
              <div>
                <p className="font-medium">Nenhum chamado encontrado</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ajuste os filtros ou crie um novo chamado.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTickets.map((ticket) => (
              <Link key={ticket.id} href={`/chamados/${ticket.id}`}>
                <Card className="border-slate-200 bg-white shadow-sm transition hover:border-yellow-300 hover:shadow-md dark:border-white/10 dark:bg-[#0B1B2B]">
                  <CardContent className="p-5">
                    <div className="grid min-w-0 gap-5 xl:grid-cols-[1fr_260px]">
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
                        <h3 className="break-words text-lg font-semibold tracking-tight">{ticket.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{ticket.description}</p>
                      </div>
                      <div className="grid gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">
                        <InfoPill label="Risco" value={getOperationalRisk(ticket)} />
                        <InfoPill label="Idade" value={`${getTicketAgeInHours(ticket)}h`} />
                        <InfoPill label="Atualizado" value={formatDate(ticket.updated_at)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function QueueStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-slate-500 dark:text-slate-400">{label}</span>
      <span className="min-w-0 truncate font-medium">{value}</span>
    </div>
  );
}
