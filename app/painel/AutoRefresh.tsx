"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Atualiza a lista enquanto houver mensagens sendo processadas. */
export function AutoRefresh({ ms = 5000 }: { ms?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), ms);
    return () => clearInterval(t);
  }, [router, ms]);
  return null;
}
