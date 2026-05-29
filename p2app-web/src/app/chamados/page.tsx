"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Ticket } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { TicketPriorityBadge, TicketStatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { listTickets } from "@/features/chamados/chamados-service";
import { formatDate } from "@/features/chamados/chamados-format";
import type { TicketStatus } from "@/types/api";

const statusOptions: Array<{ value: "all" | TicketStatus; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "open", label: "Abertos" },
  { value: "in_progress", label: "Em andamento" },
  { value: "resolved", label: "Resolvidos" },
  { value: "closed", label: "Fechados" },
];

export default function ChamadosPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | TicketStatus>("all");
  const ticketsQuery = useQuery({ queryKey: ["tickets"], queryFn: listTickets });

  const filteredTickets = useMemo(() => {
    const tickets = ticketsQuery.data?.items ?? [];
    const term = search.toLowerCase().trim();
    return tickets.filter((ticket) => {
      const matchesSearch = !term || ticket.title.toLowerCase().includes(term) || ticket.description.toLowerCase().includes(term);
      const matchesStatus = status === "all" || ticket.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status, ticketsQuery.data?.items]);

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Consulta e triagem</p>
            <h2 className="text-2xl font-semibold">Chamados técnicos</h2>
          </div>
          <Link href="/chamados/novo" className={buttonVariants({ className: "bg-yellow-400 text-slate-950 hover:bg-yellow-300" })}>
            <Plus className="size-4" />
            Criar chamado
          </Link>
        </div>

        <Card className="border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B1B2B]">
          <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título ou descrição" className="pl-9" />
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as "all" | TicketStatus)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
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
            <CardContent className="p-6 text-red-700 dark:text-red-200">Não foi possível carregar os chamados.</CardContent>
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
                <Card className="border-slate-200 bg-white transition hover:border-yellow-300 hover:shadow-md dark:border-white/10 dark:bg-[#0B1B2B]">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <TicketStatusBadge status={ticket.status} />
                          <TicketPriorityBadge priority={ticket.priority} />
                        </div>
                        <h3 className="text-lg font-semibold">{ticket.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{ticket.description}</p>
                      </div>
                      <div className="grid gap-1 text-sm text-slate-500 dark:text-slate-400 lg:text-right">
                        <span>Criado em {formatDate(ticket.created_at)}</span>
                        <span>Dono #{ticket.owner_id}</span>
                        <span>Responsável {ticket.assigned_to_id ? `#${ticket.assigned_to_id}` : "não definido"}</span>
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
