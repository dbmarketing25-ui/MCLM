import "server-only";
import { cookies } from "next/headers";
import { hasEditAccess, PAINEL_COOKIE } from "@/lib/painel-auth";

/** O visitante atual é o dono do site (pode editar)? */
export async function isOwner() {
  return hasEditAccess((await cookies()).get(PAINEL_COOKIE)?.value);
}
