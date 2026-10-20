"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/supabase/server";
import { canonicalBook } from "@/lib/bible";
import { fillExactVerses } from "@/lib/ai";
import { parseAiText } from "@/lib/prompt";
import { uniqueSlug } from "@/lib/utils";
import { isOwner } from "@/lib/owner";

const NAO_AUTORIZADO = "Você não tem permissão para editar. Entre no painel com a senha.";
import type { Category, KeyPoint, Status, Verse } from "@/lib/types";

export type SavePayload = {
  id: string;
  status: Extract<Status, "draft" | "published">;
  category: Category;
  title: string;
  date: string;
  preacher: string;
  series: string;
  main_topic: string;
  summary: string;
  verses: Verse[];
  key_points: KeyPoint[];
  quotes: string[];
  transcript: string;
};

export async function saveMessage(p: SavePayload): Promise<{ error?: string; slug?: string }> {
  if (!(await isOwner())) return { error: NAO_AUTORIZADO };
  const supabase = db();

  if (!p.title.trim()) return { error: "O título é obrigatório." };
  if (p.status === "published" && !p.summary.trim()) return { error: "Escreva o resumo antes de publicar." };

  const verses = p.verses
    .filter((v) => v.reference.trim() || v.text.trim())
    .map((v) => {
      const parsed = parseReference(v.reference);
      return { ...v, ...parsed, reference: v.reference.trim(), text: v.text.trim() };
    });

  const books = [...new Set(verses.map((v) => v.book).filter(Boolean))];

  const { data, error } = await supabase
    .from("messages")
    .update({
      status: p.status,
      category: p.category,
      title: p.title.trim(),
      date: p.date,
      preacher: p.preacher.trim(),
      series: p.series.trim() || null,
      main_topic: p.main_topic.trim(),
      summary: p.summary.trim(),
      verses,
      books,
      key_points: p.key_points.filter((k) => k.title.trim() || k.description.trim()),
      quotes: p.quotes.map((q) => q.trim()).filter(Boolean),
      transcript: p.transcript,
      error: null,
    })
    .eq("id", p.id)
    .select("slug")
    .single();

  if (error) return { error: "Não foi possível salvar. " + error.message };

  revalidatePath("/", "layout");
  return { slug: data.slug };
}

/** Modo grátis: recebe a resposta copiada do claude.ai e cria o rascunho. */
export async function createFromManual(input: {
  transcript: string;
  category: Category;
  date: string;
  preacher: string;
  series: string;
  aiText: string;
}): Promise<{ error?: string; id?: string }> {
  if (!(await isOwner())) return { error: NAO_AUTORIZADO };
  let result;
  try {
    result = parseAiText(input.aiText);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Resposta inválida." };
  }
  if (!result.title && !result.summary.length) {
    return { error: "A resposta não tem título nem resumo. Confira se copiou a resposta inteira." };
  }
  await fillExactVerses(result);

  const { data, error } = await db()
    .from("messages")
    .insert({
      slug: uniqueSlug(result.title || "mensagem"),
      status: "draft",
      category: input.category === "estudo" ? "estudo" : "pregacao",
      date: input.date || new Date().toISOString().slice(0, 10),
      preacher: input.preacher.trim(),
      series: input.series.trim() || null,
      transcript: input.transcript.trim(),
      title: result.title,
      main_topic: result.main_topic,
      summary: result.summary.join("\n\n"),
      verses: result.verses,
      key_points: result.key_points,
      quotes: result.quotes,
      books: [...new Set(result.verses.map((v) => v.book).filter(Boolean))],
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Não foi possível salvar: " + (error?.message ?? "") };
  revalidatePath("/painel");
  return { id: data.id };
}

export async function deleteMessage(formData: FormData) {
  if (!(await isOwner())) redirect("/entrar");
  const supabase = db();
  const id = String(formData.get("id") ?? "");
  if (id) await supabase.from("messages").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/painel");
}

/** "1 Coríntios 13:4-7" -> { book: "1 Coríntios", chapter: 13, verses: "4-7" } */
function parseReference(ref: string): Pick<Verse, "book" | "chapter" | "verses"> {
  const m = ref.trim().match(/^(.+?)\s+(\d+)(?:\s*[:.,]\s*([\d\s\-–,]+))?$/);
  if (!m) return { book: canonicalBook(ref) ?? "", chapter: 0, verses: "" };
  return {
    book: canonicalBook(m[1]) ?? m[1].trim(),
    chapter: Number(m[2]),
    verses: (m[3] ?? "").replace(/\s/g, "").replace("–", "-"),
  };
}
