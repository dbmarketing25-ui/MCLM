/**
 * Senha opcional do painel. Se PAINEL_SENHA não estiver definida, o painel fica aberto.
 * Funciona no middleware (edge) e no servidor (Node).
 */
export const PAINEL_COOKIE = "mclm_painel";

export function painelSenha() {
  return process.env.PAINEL_SENHA?.trim() || "";
}

/** Valor guardado no cookie: hash da senha (a senha em si nunca vai para o navegador). */
export async function painelToken(senha: string) {
  const data = new TextEncoder().encode(`mclm-painel:${senha}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}
