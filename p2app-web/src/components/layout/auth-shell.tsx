import Link from "next/link";
import { ReactNode } from "react";
import { Ticket } from "lucide-react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-[#07111F] text-white lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden border-r border-white/10 bg-[linear-gradient(135deg,#07111F,#0B1B2B_55%,#102A43)] p-10 lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-400 text-slate-950">
            <Ticket className="size-5" />
          </div>
          <div>
            <p className="text-lg font-semibold">P2App</p>
            <p className="text-xs text-slate-400">Helpdesk técnico</p>
          </div>
        </Link>
        <div>
          <p className="mb-4 inline-flex rounded-full border border-yellow-300/30 bg-yellow-300/10 px-3 py-1 text-sm text-yellow-200">
            Operação com JWT e perfis
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight">
            Controle chamados técnicos com uma interface rápida e profissional.
          </h1>
          <p className="mt-4 max-w-lg text-slate-300">
            Entre, acompanhe prioridades, atualize status e mantenha a fila de suporte organizada.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl dark:bg-[#0B1B2B] dark:text-white">
          <div className="mb-6">
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-300">P2App</p>
            <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
