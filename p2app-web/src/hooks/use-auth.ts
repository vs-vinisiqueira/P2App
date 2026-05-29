"use client";

import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getMe } from "@/features/auth/auth-service";
import { getToken, setStoredUser } from "@/lib/auth";

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const token = getToken();

  const query = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, token]);

  useEffect(() => {
    if (query.data) {
      setStoredUser(query.data);
    }
  }, [query.data]);

  return query;
}
