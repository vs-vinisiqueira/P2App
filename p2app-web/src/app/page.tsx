import Link from "next/link";
import { ArrowRight, CheckCircle, LayoutDashboard, ShieldCheck, Ticket, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { branding } from "@/config/branding";

const benefits = [
  { title: "Gestão centralizada de chamados", icon: Ticket },
  { title: "Controle de status e prioridade", icon: CheckCircle },
  { title: "Autenticação segura com JWT", icon: ShieldCheck },
  { title: "Organização por perfis de usuário", icon: Users },
];

const previewTickets = [
  { title: "VPN corporativa instável", priority: "Crítica", progress: 72 },
  { title: "Notebook sem rede", priority: "Alta", progress: 54 },
  { title: "Acesso ao sistema financeiro", priority: "Média", progress: 39 },
];

export default function Home() {
  return (
    <main
      className="min-h-screen text-white"
      style={{ backgroundColor: `var(--brand-bg-deep, #07111f)` }}
    >
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at top right, var(--brand-accent-glow, rgba(246,196,59,0.18)), transparent 30rem), linear-gradient(135deg, var(--brand-bg-deep, #07111f) 0%, var(--brand-bg-card, #0b1b2b) 55%, var(--brand-bg-accent, #12365b) 100%)`,
          }}
        />
        <div className="relative mx-auto grid min-h-[92vh] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm"
              style={{
                border: `1px solid color-mix(in srgb, var(--brand-accent) 30%, transparent)`,
                background: `color-mix(in srgb, var(--brand-accent) 10%, transparent)`,
                color: `var(--brand-accent)`,
              }}
            >
              <LayoutDashboard className="size-4" />
              {branding.heroSubtitle}
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
              {branding.appName}
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-slate-300">
              {branding.appDescription}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className={buttonVariants({ size: "lg", className: "w-full sm:w-auto text-slate-950" })}
                style={{ backgroundColor: `var(--brand-accent)` }}
              >
                Entrar
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/register"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className: "w-full border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto",
                })}
              >
                Criar conta
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-slate-400">Fila técnica</p>
                <p className="text-2xl font-semibold">Chamados em tempo real</p>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold text-slate-950"
                style={{ backgroundColor: `var(--brand-accent)` }}
              >
                {branding.appShortName}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 pb-4 text-center text-sm">
              <PreviewMetric label="Ativos" value="18" />
              <PreviewMetric label="Críticos" value="3" />
              <PreviewMetric label="SLA" value="87%" />
            </div>
            <div className="space-y-3">
              {previewTickets.map((ticket) => (
                <div
                  key={ticket.title}
                  className="rounded-lg border border-white/10 p-4"
                  style={{ backgroundColor: `var(--brand-bg-card, #0b1b2b)` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate font-medium">{ticket.title}</p>
                    <span
                      className="rounded-md px-2 py-1 text-xs"
                      style={{
                        background: `color-mix(in srgb, var(--brand-accent) 15%, transparent)`,
                        color: `var(--brand-accent)`,
                      }}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${ticket.progress}%`, backgroundColor: `var(--brand-accent)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border-white/10 bg-white/[0.04] text-white">
              <CardContent className="p-5">
                <benefit.icon className="mb-4 size-6" style={{ color: `var(--brand-accent)` }} />
                <p className="font-medium">{benefit.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
