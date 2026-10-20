import "server-only";
import { db } from "@/lib/supabase/server";
import { bookOrder } from "@/lib/bible";
import { CARD_COLUMNS, type Category, type Message, type MessageCard } from "@/lib/types";

/** Consultas das páginas de leitura — sempre apenas itens publicados. */

export async function getLatest(category: Category, limit = 8) {
  const supabase = db();
  const { data } = await supabase
    .from("messages")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .eq("category", category)
    .order("date", { ascending: false })
    .limit(limit);
  return (data ?? []) as MessageCard[];
}

export async function getMostRecent() {
  const supabase = db();
  const { data } = await supabase
    .from("messages")
    .select(`${CARD_COLUMNS}, summary`)
    .eq("status", "published")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as (MessageCard & { summary: string }) | null;
}

export async function getStats() {
  const supabase = db();
  const { data } = await supabase
    .from("messages")
    .select("category, books, series")
    .eq("status", "published");
  const rows = (data ?? []) as Pick<Message, "category" | "books" | "series">[];
  return {
    pregacoes: rows.filter((r) => r.category === "pregacao").length,
    estudos: rows.filter((r) => r.category === "estudo").length,
    livros: new Set(rows.flatMap((r) => r.books ?? [])).size,
    series: new Set(rows.map((r) => r.series?.trim()).filter(Boolean)).size,
  };
}

export type ListFilters = { pregador?: string; serie?: string; livro?: string; q?: string };

export async function listMessages(category: Category, f: ListFilters) {
  const supabase = db();
  let query = supabase
    .from("messages")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .eq("category", category)
    .order("date", { ascending: false })
    .limit(200);

  if (f.pregador) query = query.eq("preacher", f.pregador);
  if (f.serie) query = query.eq("series", f.serie);
  if (f.livro) query = query.contains("books", [f.livro]);
  if (f.q?.trim()) query = query.textSearch("fts", f.q.trim(), { type: "websearch", config: "portuguese" });

  const { data } = await query;
  return (data ?? []) as MessageCard[];
}

/** Opções dos filtros (pregadores, séries e livros já usados na categoria). */
export async function getFilterOptions(category: Category) {
  const supabase = db();
  const { data } = await supabase
    .from("messages")
    .select("preacher, series, books")
    .eq("status", "published")
    .eq("category", category);
  const rows = (data ?? []) as Pick<Message, "preacher" | "series" | "books">[];
  const sortPt = (a: string, b: string) => a.localeCompare(b, "pt-BR");
  return {
    preachers: [...new Set(rows.map((r) => r.preacher).filter(Boolean))].sort(sortPt),
    series: [...new Set(rows.map((r) => r.series ?? "").filter(Boolean))].sort(sortPt),
    books: [...new Set(rows.flatMap((r) => r.books ?? []))].sort((a, b) => bookOrder(a) - bookOrder(b)),
  };
}

export async function getBySlug(slug: string) {
  const supabase = db();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data as Message | null;
}

/** Mensagens vizinhas (anterior/próxima) na mesma categoria. */
export async function getNeighbors(m: Pick<Message, "category" | "date" | "id">) {
  const supabase = db();
  const [older, newer] = await Promise.all([
    supabase
      .from("messages")
      .select("slug, title, date")
      .eq("status", "published")
      .eq("category", m.category)
      .lt("date", m.date)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("slug, title, date")
      .eq("status", "published")
      .eq("category", m.category)
      .gt("date", m.date)
      .order("date", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);
  type N = { slug: string; title: string; date: string } | null;
  return { older: older.data as N, newer: newer.data as N };
}
