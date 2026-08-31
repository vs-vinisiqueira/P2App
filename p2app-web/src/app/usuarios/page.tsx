"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Users } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listUsers } from "@/features/users/users-service";
import { getStoredUser, isSupportUser } from "@/lib/auth";

export default function UsuariosPage() {
  const currentUser = getStoredUser();
  const canSeeUsers = isSupportUser(currentUser);
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => listUsers(),
    enabled: canSeeUsers,
    retry: false,
  });

  return (
    <AppShell>
      {!canSeeUsers ? (
        <Card className="border-yellow-300 bg-yellow-50 shadow-sm dark:border-yellow-400/30 dark:bg-yellow-400/10">
          <CardContent className="flex items-start gap-3 p-6 text-yellow-900 dark:text-yellow-100">
            <ShieldCheck className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-medium">Acesso restrito</p>
              <p className="mt-1 text-sm">A listagem de usuarios exige perfil administrativo no backend.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1B2B]">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Users className="size-5 text-yellow-600 dark:text-yellow-300" />
                <CardTitle>Usuarios cadastrados</CardTitle>
              </div>
              <Badge variant="outline">{usersQuery.data?.length ?? 0} registros</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {usersQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : usersQuery.isError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                Nao foi possivel carregar usuarios. Confirme se seu perfil possui role de administrador.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(usersQuery.data ?? []).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.nome}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.tipo_usuario}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.role === "admin" ? "bg-yellow-400 text-slate-950" : ""}>{user.role}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
