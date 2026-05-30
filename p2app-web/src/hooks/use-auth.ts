"use client";

import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";

import { getMe } from "@/features/auth/auth-service";
import { getToken, setStoredUser } from "@/lib/auth";

function subscribeToAuthStorage() {
  return () => {};
}

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const hasMounted = useSyncExternalStore(subscribeToAuthStorage, () => true, () => false);
  const token = useSyncExternalStore(subscribeToAuthStorage, getToken, () => null);

  const query = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: hasMounted && Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (hasMounted && !token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hasMounted, pathname, router, token]);

  useEffect(() => {
    if (query.data) {
      setStoredUser(query.data);
    }
  }, [query.data]);

  return {
    ...query,
    isLoading: !hasMounted || query.isLoading,
  };
}
