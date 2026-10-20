import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Cliente do Supabase usado apenas no servidor, com a chave de serviço.
 * O navegador nunca acessa o banco diretamente.
 */
export function db() {
  if (!client) {
    // A integração Supabase da Vercel cria SUPABASE_URL e NEXT_PUBLIC_SUPABASE_URL automaticamente.
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}
