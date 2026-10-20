/**
 * Acesso de edição (somente o dono do site).
 * - Com PAINEL_SENHA definida: o painel pede a senha.
 * - Sem PAINEL_SENHA: o painel fica BLOQUEADO no site publicado; só funciona no computador (npm run dev).
 * Funciona no middleware (edge) e no servidor (Node).
 */
export const PAINEL_COOKIE = "mclm_painel";

export function painelSenha() {
  return process.env.PAINEL_SENHA?.trim() || "";
}

/** Rodando no computador (desenvolvimento)? Lá o painel fica liberado se não houver senha. */
export function isDev() {
  return process.env.NODE_ENV !== "production";
}

/** Valor guardado no cookie: hash da senha (a senha em si nunca vai para o navegador). */
export async function painelToken(senha: string) {
  const data = new TextEncoder().encode(`mclm-painel:${senha}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** O valor do cookie dá acesso de edição? */
export async function hasEditAccess(cookieValue: string | undefined) {
  const senha = painelSenha();
  if (!senha) return isDev();
  return !!cookieValue && cookieValue === (await painelToken(senha));
}
