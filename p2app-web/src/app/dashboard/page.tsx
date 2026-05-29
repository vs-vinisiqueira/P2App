"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Clock, Plus, Ticket } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listTickets } from "@/features/chamados/chamados-service";
import { formatDate } from "@/features/chamados/chamados-format";
import type { TicketStatus } from "@/types/api";

const summary = [
  { label: "Total de chamados", icon: Ticket, status: null },
  { label: "Abertos", icon: AlertCircle, status: "open" },
  { label: "Em andamento", icon: Clock, status: "in_progress" },
  { label: "Concluídos/fechados", icon: CheckCircle, status: "done" },
] as const;

export default function DashboardPage() {
  const ticketsQuery = useQuery({ queryKey: ["tickets"], queryFn: listTickets });
  const tickets = ticketsQuery.data?.items ?? [];

  function countBy(status: TicketStatus | "done" | null) {
    if (!status) return ticketsQuery.data?.total ?? tickets.length;
    if (status === "done") return tickets.filter((ticket) => ticket.status === "resolved" || ticket.status === "closed").length;
    return tickets.filter((ticket) => ticket.status === status).length;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 rounded-xl border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Resumo operacional</p>
            <h2 className="text-2xl font-semibold">Fila de atendimento técnico</h2>
          </div>
          <Link href="/chamados/novo" className={buttonVariants({ className: "bg-yellow-400 text-slate-950 hover:bg-yellow-300" })}>
            <Plus className="size-4" />
            Novo chamado
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) => (
            <Card key={item.label} className="border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B1B2B]">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                  {ticketsQuery.isLoading ? <Skeleton className="mt-2 h-8 w-16" /> : <p className="mt-2 text-3xl font-semibold">{countBy(item.status)}</p>}
                </div>
                <div className="flex size-11 items-center justify-center rounded-lg bg-yellow-400/15 text-yellow-600 dark:text-yellow-300">
                  <item.icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B1B2B]">
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
                Não foi possível carregar os chamados.
              </p>
            ) : tickets.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Nenhum chamado encontrado. Crie o primeiro para iniciar a fila.
              </p>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-white/10">
                {tickets.slice(0, 5).map((ticket) => (
                  <Link key={ticket.id} href={`/chamados/${ticket.id}`} className="flex flex-col gap-3 py-4 transition hover:bg-slate-50 dark:hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(ticket.created_at)}</p>
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
      </div>
    </AppShell>
  );
}
