import type { Verse } from "@/lib/types";

/** Os 66 livros, em ordem canônica: [nome em português, nome em inglês (bible-api.com)]. */
export const BIBLE_BOOKS: [string, string][] = [
  ["Gênesis", "genesis"], ["Êxodo", "exodus"], ["Levítico", "leviticus"], ["Números", "numbers"],
  ["Deuteronômio", "deuteronomy"], ["Josué", "joshua"], ["Juízes", "judges"], ["Rute", "ruth"],
  ["1 Samuel", "1 samuel"], ["2 Samuel", "2 samuel"], ["1 Reis", "1 kings"], ["2 Reis", "2 kings"],
  ["1 Crônicas", "1 chronicles"], ["2 Crônicas", "2 chronicles"], ["Esdras", "ezra"], ["Neemias", "nehemiah"],
  ["Ester", "esther"], ["Jó", "job"], ["Salmos", "psalms"], ["Provérbios", "proverbs"],
  ["Eclesiastes", "ecclesiastes"], ["Cânticos", "song of solomon"], ["Isaías", "isaiah"], ["Jeremias", "jeremiah"],
  ["Lamentações", "lamentations"], ["Ezequiel", "ezekiel"], ["Daniel", "daniel"], ["Oseias", "hosea"],
  ["Joel", "joel"], ["Amós", "amos"], ["Obadias", "obadiah"], ["Jonas", "jonah"],
  ["Miqueias", "micah"], ["Naum", "nahum"], ["Habacuque", "habakkuk"], ["Sofonias", "zephaniah"],
  ["Ageu", "haggai"], ["Zacarias", "zechariah"], ["Malaquias", "malachi"],
  ["Mateus", "matthew"], ["Marcos", "mark"], ["Lucas", "luke"], ["João", "john"],
  ["Atos", "acts"], ["Romanos", "romans"], ["1 Coríntios", "1 corinthians"], ["2 Coríntios", "2 corinthians"],
  ["Gálatas", "galatians"], ["Efésios", "ephesians"], ["Filipenses", "philippians"], ["Colossenses", "colossians"],
  ["1 Tessalonicenses", "1 thessalonians"], ["2 Tessalonicenses", "2 thessalonians"], ["1 Timóteo", "1 timothy"],
  ["2 Timóteo", "2 timothy"], ["Tito", "titus"], ["Filemom", "philemon"], ["Hebreus", "hebrews"],
  ["Tiago", "james"], ["1 Pedro", "1 peter"], ["2 Pedro", "2 peter"], ["1 João", "1 john"],
  ["2 João", "2 john"], ["3 João", "3 john"], ["Judas", "jude"], ["Apocalipse", "revelation"],
];

export const BOOK_NAMES = BIBLE_BOOKS.map(([pt]) => pt);

const strip = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[º°ª.]/g, "")
    .replace(/^(i{1,3})\s+/, (m) => `${m.trim().length} `)
    .replace(/^(primeira|primeiro)\s+/, "1 ")
    .replace(/^(segunda|segundo)\s+/, "2 ")
    .replace(/^(terceira|terceiro)\s+/, "3 ")
    .replace(/\s+/g, " ")
    .trim();

const ALIASES: Record<string, string> = {
  genesis: "Gênesis", exodo: "Êxodo", salmo: "Salmos", sl: "Salmos", "cantares": "Cânticos",
  "cantico dos canticos": "Cânticos", "canticos dos canticos": "Cânticos", "cantares de salomao": "Cânticos",
  oseias: "Oseias", miqueias: "Miqueias", "atos dos apostolos": "Atos", filemon: "Filemom", ap: "Apocalipse",
};

/** Converte o nome devolvido pela IA para o nome canônico em português. */
export function canonicalBook(name: string): string | null {
  const key = strip(name);
  const found = BIBLE_BOOKS.find(([pt]) => strip(pt) === key);
  if (found) return found[0];
  return ALIASES[key] ?? null;
}

export function bookOrder(name: string) {
  const i = BOOK_NAMES.indexOf(name);
  return i === -1 ? 999 : i;
}

/** Busca o texto exato em bible-api.com (Almeida). Retorna null se falhar. */
export async function fetchVerseText(v: Pick<Verse, "book" | "chapter" | "verses">): Promise<string | null> {
  const en = BIBLE_BOOKS.find(([pt]) => pt === v.book)?.[1];
  if (!en || !v.chapter) return null;
  const ref = `${en} ${v.chapter}${v.verses ? `:${v.verses.replace(/\s/g, "")}` : ""}`;
  try {
    const res = await fetch(
      `https://bible-api.com/${encodeURIComponent(ref)}?translation=almeida`,
      { signal: AbortSignal.timeout(6000), cache: "force-cache" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { verses?: { verse: number; text: string }[] };
    if (!data.verses?.length) return null;
    return data.verses
      .map((x) => x.text.replace(/\s+/g, " ").trim())
      .join(" ")
      .trim();
  } catch {
    return null;
  }
}
