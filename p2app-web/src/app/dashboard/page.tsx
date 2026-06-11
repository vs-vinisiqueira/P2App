"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Gauge,
  Plus,
  ShieldAlert,
  Ticket,
  UserRoundX,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getOperationalRisk,
  getPriorityQueue,
  getStatusCounts,
  getTicketMetrics,
} from "@/features/chamados/chamados-analytics";
import { formatDate } from "@/features/chamados/chamados-format";
import { listTickets } from "@/features/chamados/chamados-service";
import { useAuthToken } from "@/hooks/use-auth";

const statusCards = [
  { label: "Abertos", icon: AlertCircle, status: "open" },
  { label: "Em andamento", icon: Clock, status: "in_progress" },
  { label: "Resolvidos", icon: CheckCircle, status: "resolved" },
  { label: "Fechados", icon: ShieldAlert, status: "closed" },
] as const;

export default function DashboardPage() {
  const { isAuthenticated } = useAuthToken();
  const ticketsQuery = useQuery({ queryKey: ["tickets"], queryFn: listTickets, enabled: isAuthenticated });
  const tickets = ticketsQuery.data?.items ?? [];
  const metrics = getTicketMetrics(tickets, ticketsQuery.data?.total);
  const statusCounts = getStatusCounts(tickets);
  const priorityQueue = getPriorityQueue(tickets).slice(0, 4);
  const recentTickets = [...tickets]
    .sort((current, next) => new Date(next.updated_at).getTime() - new Date(current.updated_at).getTime())
    .slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#091827]">
          <div className="grid gap-0 xl:grid-cols-[1fr_360px]">
            <div className="p-6 sm:p-7">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div className="min-w-0 max-w-2xl">
                  <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Resumo operacional</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    Fila de atendimento tecnico sob controle
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Visao consolidada de volume, risco e conclusao para entender onde agir primeiro.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/chamados"
                    className={buttonVariants({
                      variant: "outline",
                      className: "w-full border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:w-auto",
                    })}
                  >
                    Ver fila
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/chamados/novo"
                    className={buttonVariants({
                      className: "w-full bg-yellow-400 text-slate-950 shadow-sm hover:bg-yellow-300 sm:w-auto",
                    })}
                  >
                    <Plus className="size-4" />
                    Novo chamado
                  </Link>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard icon={Ticket} label="Total" value={metrics.total} />
                <MetricCard icon={Gauge} label="Conclusao" value={`${metrics.resolutionRate}%`} helper="Resolvidos ou fechados" />
                <MetricCard icon={ShieldAlert} label="Criticos" value={metrics.critical} helper="Prioridade maxima" />
                <MetricCard icon={UserRoundX} label="Sem dono" value={metrics.unassigned} />
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/[0.03] xl:border-l xl:border-t-0">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Distribuicao da fila</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Status atual dos chamados carregados.</p>
              <div className="mt-5 space-y-4">
                {statusCards.map((item) => (
                  <StatusMeter
                    key={item.status}
                    icon={item.icon}
                    label={item.label}
                    value={ticketsQuery.isLoading ? null : statusCounts[item.status]}
                    total={metrics.total}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <Card className="border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1B2B]">
            <CardHeader>
              <CardTitle>Chamados recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {ticketsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : ticketsQuery.isError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                  Nao foi possivel carregar os chamados.
                </p>
              ) : recentTickets.length === 0 ? (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Nenhum chamado encontrado. Crie o primeiro para iniciar a fila.
                </p>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-white/10">
                  {recentTickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      href={`/chamados/${ticket.id}`}
                      className="flex flex-col gap-3 rounded-md px-2 py-4 transition hover:bg-slate-50 dark:hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{ticket.title}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Atualizado em {formatDate(ticket.updated_at)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <TicketStatusBadge status={ticket.status} />
                        <TicketPriorityBadge priority={ticket.priority} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1B2B]">
            <CardHeader>
              <CardTitle>Fila prioritaria</CardTitle>
            </CardHeader>
            <CardContent>
              {ticketsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-20 w-full" />
                  ))}
                </div>
              ) : priorityQueue.length === 0 ? (
                <p className="rounded-lg border border-dashed p-5 text-center text-sm text-slate-500 dark:text-slate-400">
                  Sem chamados ativos na fila.
                </p>
              ) : (
                <div className="space-y-3">
                  {priorityQueue.map((ticket) => (
                    <Link
                      key={ticket.id}
                      href={`/chamados/${ticket.id}`}
                      className="block rounded-lg border border-slate-200 bg-slate-50 p-3 transition hover:border-yellow-300 hover:bg-yellow-50/70 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/5"
                    >
                      <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
                        <span className="min-w-0 truncate text-sm font-medium">{ticket.title}</span>
                        <TicketPriorityBadge priority={ticket.priority} />
                      </div>
                      <div className="flex min-w-0 items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="min-w-0 truncate">{getOperationalRisk(ticket)}</span>
                        <span>#{ticket.id}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Ticket;
  label: string;
  value: number | string;
  helper?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <div className="flex size-9 items-center justify-center rounded-md bg-yellow-400/15 text-yellow-700 dark:text-yellow-300">
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helper}</p> : null}
    </div>
  );
}

function StatusMeter({
  icon: Icon,
  label,
  value,
  total,
}: {
  icon: typeof Ticket;
  label: string;
  value: number | null;
  total: number;
}) {
  const width = value && total ? Math.max(8, Math.round((value / total) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-slate-300">
          <Icon className="size-4 shrink-0 text-yellow-600 dark:text-yellow-300" />
          <span className="truncate">{label}</span>
        </div>
        {value === null ? <Skeleton className="h-5 w-8" /> : <span className="font-medium">{value}</span>}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-full rounded-full bg-yellow-400" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
