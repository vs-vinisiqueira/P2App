"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Plus, Settings, Ticket, Users } from "lucide-react";
import { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { branding } from "@/config/branding";
import { useAuthGuard } from "@/hooks/use-auth";
import { isSupportUser, logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chamados", label: "Chamados", icon: Ticket },
  { href: "/chamados/novo", label: "Novo chamado", icon: Plus },
];

const pageMeta: Record<string, { title: string; eyebrow: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard",
    eyebrow: "Operação técnica",
    description: "Visão executiva da fila, risco operacional e ritmo de resolução.",
  },
  "/chamados": {
    title: "Chamados",
    eyebrow: "Triagem e acompanhamento",
    description: "Busque, filtre e priorize a fila de suporte em poucos segundos.",
  },
  "/chamados/novo": {
    title: "Novo chamado",
    eyebrow: "Abertura de atendimento",
    description: "Registre contexto suficiente para acelerar o primeiro atendimento.",
  },
  "/usuarios": {
    title: "Usuários",
    eyebrow: "Administração",
    description: "Consulte perfis e papéis disponíveis para a operação.",
  },
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: user, isLoading } = useAuthGuard();
  const meta = pageMeta[pathname] ?? {
    title: pathname.startsWith("/chamados/") ? "Detalhe do chamado" : branding.appName,
    eyebrow: "Atendimento",
    description: "Revise dados, histórico e próximas ações do chamado.",
  };
  const canSeeUsers = isSupportUser(user ?? null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  if (isLoading && !user) {
    return (
      <main
        className="flex min-h-screen items-center justify-center text-slate-100"
        style={{ backgroundColor: `var(--brand-bg-deep, #07111f)` }}
      >
        <div className="rounded-lg border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-300 shadow-2xl">
          Carregando ambiente seguro...
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen text-slate-950 dark:text-slate-100" style={{ ["--tw-bg-opacity" as string]: "1" }}>
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-68 border-r border-white/10 text-white lg:block"
        style={{ backgroundColor: `var(--brand-bg-deep, #07111f)` }}
      >
        <div className="flex h-full flex-col">
          <div className="px-5 py-5">
            <BrandLink />
          </div>
          <Separator className="bg-white/10" />
          <nav className="flex-1 space-y-1 px-3 py-5">
            {navigation.map((item) => (
              <SidebarLink key={item.href} active={pathname === item.href} {...item} />
            ))}
            {canSeeUsers ? (
              <SidebarLink href="/usuarios" label="Usuários" icon={Users} active={pathname === "/usuarios"} />
            ) : null}
          </nav>
          <div className="border-t border-white/10 p-4">
            <div className="mb-4 rounded-lg bg-white/[0.06] p-3 ring-1 ring-white/10">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback
                    className="text-slate-950"
                    style={{ backgroundColor: `var(--brand-accent)` }}
                  >
                    {user?.nome?.slice(0, 2).toUpperCase() ?? branding.appShortName}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user?.nome ?? "Usuário"}</p>
                  <p className="truncate text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="mt-3"
                style={{
                  border: `1px solid color-mix(in srgb, var(--brand-accent) 30%, transparent)`,
                  background: `color-mix(in srgb, var(--brand-accent) 10%, transparent)`,
                  color: `var(--brand-accent)`,
                }}
              >
                {user?.tipo_usuario ?? "sessão"}
              </Badge>
            </div>
            <Button
              variant="outline"
              className="w-full border-white/10 bg-transparent text-white hover:bg-white/10"
              onClick={logout}
            >
              <LogOut className="size-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-68">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur dark:border-white/10 dark:bg-[#07111F]/92 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <p
                  className="text-xs font-semibold uppercase"
                  style={{ color: `var(--brand-accent)` }}
                >
                  {meta.eyebrow}
                </p>
                <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight">{meta.title}</h1>
                <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">{meta.description}</p>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <div className="flex min-w-0 items-center gap-2">
                    <Settings
                      className="size-4 shrink-0"
                      style={{ color: `var(--brand-accent)` }}
                    />
                    <span className="truncate">API {apiUrl}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 lg:hidden"
                  onClick={logout}
                >
                  <LogOut className="size-4" />
                  Sair
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
              {navigation.map((item) => (
                <MobileNavLink key={item.href} active={pathname === item.href} {...item} />
              ))}
              {canSeeUsers ? (
                <MobileNavLink href="/usuarios" label="Usuários" icon={Users} active={pathname === "/usuarios"} />
              ) : null}
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function BrandLink() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <div
        className="flex size-10 items-center justify-center rounded-lg text-slate-950 shadow-lg"
        style={{
          backgroundColor: `var(--brand-accent)`,
          boxShadow: `0 10px 15px -3px color-mix(in srgb, var(--brand-accent) 20%, transparent)`,
        }}
      >
        <Ticket className="size-5" />
      </div>
      <div>
        <p className="text-lg font-semibold">{branding.appName}</p>
        <p className="text-xs text-slate-400">{branding.appTagline}</p>
      </div>
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10",
      )}
      style={
        active
          ? {
              border: `1px solid var(--brand-accent)`,
              backgroundColor: `var(--brand-accent)`,
              color: `#020617`,
            }
          : undefined
      }
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white",
      )}
      style={
        active
          ? {
              backgroundColor: `var(--brand-accent)`,
              color: `#020617`,
              boxShadow: `0 1px 2px 0 color-mix(in srgb, var(--brand-accent) 20%, transparent)`,
            }
          : undefined
      }
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
