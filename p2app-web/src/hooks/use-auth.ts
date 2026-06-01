"use client";

import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";

import { getMe } from "@/features/auth/auth-service";
import { getToken, setStoredUser, subscribeToAuthChanges } from "@/lib/auth";

export function useAuthToken() {
  const hasMounted = useSyncExternalStore(subscribeToAuthChanges, () => true, () => false);
  const token = useSyncExternalStore(subscribeToAuthChanges, getToken, () => null);

  return {
    hasMounted,
    token,
    isAuthenticated: hasMounted && Boolean(token),
  };
}

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { hasMounted, token, isAuthenticated } = useAuthToken();

  const query = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: isAuthenticated,
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
    data: token ? query.data : undefined,
    isLoading: !hasMounted || !token || query.isLoading,
  };
}
