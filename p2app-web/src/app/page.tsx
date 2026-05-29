import Link from "next/link";
import { ArrowRight, CheckCircle, LayoutDashboard, ShieldCheck, Ticket, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  { title: "Gestão centralizada de chamados", icon: Ticket },
  { title: "Controle de status e prioridade", icon: CheckCircle },
  { title: "Autenticação segura com JWT", icon: ShieldCheck },
  { title: "Organização por perfis de usuário", icon: Users },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07111F] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.16),transparent_30%),linear-gradient(135deg,#07111F_0%,#0B1B2B_55%,#102A43_100%)]" />
        <div className="relative mx-auto grid min-h-[92vh] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-300/10 px-3 py-1 text-sm text-yellow-200">
              <LayoutDashboard className="size-4" />
              Sistema SaaS para operação técnica
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
              P2App
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-slate-300">
              Sistema de gestão de chamados técnicos com autenticação JWT, controle de perfis e fluxo profissional para equipes de suporte.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className={buttonVariants({
                  size: "lg",
                  className: "bg-yellow-400 text-slate-950 hover:bg-yellow-300",
                })}
              >
                Entrar
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/register"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className: "border-white/20 bg-white/5 text-white hover:bg-white/10",
                })}
              >
                Criar conta
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-slate-400">Fila técnica</p>
                <p className="text-2xl font-semibold">Chamados em tempo real</p>
              </div>
              <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-slate-950">P2</span>
            </div>
            <div className="space-y-3">
              {["VPN corporativa instável", "Notebook sem rede", "Acesso ao sistema financeiro"].map((title, index) => (
                <div key={title} className="rounded-lg border border-white/10 bg-[#0B1B2B] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{title}</p>
                    <span className="rounded-md bg-yellow-400/15 px-2 py-1 text-xs text-yellow-200">
                      {index === 0 ? "critical" : index === 1 ? "high" : "medium"}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-yellow-400" style={{ width: `${45 + index * 18}%` }} />
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
                <benefit.icon className="mb-4 size-6 text-yellow-300" />
                <p className="font-medium">{benefit.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
