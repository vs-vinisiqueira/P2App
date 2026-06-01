"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Plus, Settings, Ticket, Users } from "lucide-react";
import { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthGuard } from "@/hooks/use-auth";
import { isSupportUser, logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chamados", label: "Chamados", icon: Ticket },
  { href: "/chamados/novo", label: "Novo chamado", icon: Plus },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chamados": "Chamados",
  "/chamados/novo": "Novo chamado",
  "/usuarios": "Usuarios",
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: user, isLoading } = useAuthGuard();
  const title = pageTitles[pathname] ?? (pathname.startsWith("/chamados/") ? "Detalhe do chamado" : "P2App");
  const canSeeUsers = isSupportUser(user ?? null);

  if (isLoading && !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-lg border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-300">
          Carregando ambiente seguro...
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-[#07111F] dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-[#07111F] text-white lg:block">
        <div className="flex h-full flex-col">
          <div className="px-6 py-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-400 text-slate-950">
                <Ticket className="size-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">P2App</p>
                <p className="text-xs text-slate-400">Helpdesk tecnico</p>
              </div>
            </Link>
          </div>
          <Separator className="bg-white/10" />
          <nav className="flex-1 space-y-1 px-4 py-5">
            {navigation.map((item) => (
              <SidebarLink key={item.href} active={pathname === item.href} {...item} />
            ))}
            {canSeeUsers ? <SidebarLink href="/usuarios" label="Usuarios" icon={Users} active={pathname === "/usuarios"} /> : null}
          </nav>
          <div className="border-t border-white/10 p-4">
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-white/5 p-3">
              <Avatar className="size-9">
                <AvatarFallback className="bg-yellow-400 text-slate-950">
                  {user?.nome?.slice(0, 2).toUpperCase() ?? "P2"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user?.nome ?? "Usuario"}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full border-white/10 bg-transparent text-white hover:bg-white/10" onClick={logout}>
              <LogOut className="size-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-white/10 dark:bg-[#07111F]/90 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-300">Operacao tecnica</p>
                <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <div className="flex min-w-0 items-center gap-2">
                    <Settings className="size-4 shrink-0 text-yellow-500" />
                    <span className="truncate">API: {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}</span>
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

            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:hidden">
              {navigation.map((item) => (
                <MobileNavLink key={item.href} active={pathname === item.href} {...item} />
              ))}
              {canSeeUsers ? <MobileNavLink href="/usuarios" label="Usuarios" icon={Users} active={pathname === "/usuarios"} /> : null}
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
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
        "flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10",
        active && "border-yellow-300 bg-yellow-400 text-slate-950 hover:bg-yellow-300 dark:border-yellow-300 dark:bg-yellow-400 dark:text-slate-950",
      )}
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
        active && "bg-yellow-400 text-slate-950 hover:bg-yellow-300 hover:text-slate-950",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
