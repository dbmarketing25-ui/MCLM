"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/supabase/server";
import { canonicalBook } from "@/lib/bible";
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

export async function deleteMessage(formData: FormData) {
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
