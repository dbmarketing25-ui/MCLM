export type Category = "pregacao" | "estudo";
export type Status = "processing" | "draft" | "published" | "error";

export type Verse = {
  reference: string; // "Romanos 8:28-30"
  book: string; // "Romanos"
  chapter: number;
  verses: string; // "28-30"
  text: string;
};

export type KeyPoint = {
  title: string;
  description: string;
};

export type Message = {
  id: string;
  slug: string;
  status: Status;
  category: Category;
  title: string;
  date: string;
  preacher: string;
  series: string | null;
  main_topic: string;
  summary: string;
  verses: Verse[];
  key_points: KeyPoint[];
  quotes: string[];
  books: string[];
  transcript: string;
  error: string | null;
  created_at: string;
  updated_at: string;
};

/** Campos usados em listagens (sem a transcrição, que é pesada). */
export type MessageCard = Pick<
  Message,
  "id" | "slug" | "category" | "title" | "date" | "preacher" | "series" | "main_topic" | "books"
>;

export const CARD_COLUMNS = "id, slug, category, title, date, preacher, series, main_topic, books";

export const CATEGORY_LABEL: Record<Category, { singular: string; plural: string; path: string }> = {
  pregacao: { singular: "Pregação", plural: "Pregações", path: "/pregacoes" },
  estudo: { singular: "Estudo", plural: "Estudos", path: "/estudos" },
};

/** Resultado gerado pela IA, antes de virar uma mensagem. */
export type AiResult = {
  title: string;
  main_topic: string;
  summary: string[];
  verses: Verse[];
  key_points: KeyPoint[];
  quotes: string[];
};
