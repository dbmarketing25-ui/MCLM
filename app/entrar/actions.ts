"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PAINEL_COOKIE, painelSenha, painelToken } from "@/lib/painel-auth";

export async function entrar(_: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const senha = painelSenha();
  const volta = String(formData.get("volta") ?? "/painel");
  const destino = volta.startsWith("/painel") ? volta : "/painel";
  if (!senha) redirect(destino);

  if (String(formData.get("senha") ?? "") !== senha) return { error: "Senha incorreta." };

  (await cookies()).set(PAINEL_COOKIE, await painelToken(senha), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60, // 60 dias
  });
  redirect(destino);
}
