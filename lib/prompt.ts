import type { AiResult, Category, Verse } from "@/lib/types";
import { BOOK_NAMES, canonicalBook } from "@/lib/bible";

/**
 * Instruções da IA — compartilhadas entre o modo automático (API) e o modo
 * manual (copiar e colar no claude.ai).
 */
export const SYSTEM_PROMPT = `Você é um assistente editorial de uma igreja evangélica brasileira. Recebe a transcrição (feita por software, com erros de reconhecimento de fala) de uma pregação de culto de domingo ou de um estudo bíblico, e produz um registro fiel e bem escrito em português do Brasil.

Diretrizes:
- Seja fiel ao que o pregador realmente disse. Não acrescente doutrina, interpretações ou aplicações que não estejam na mensagem.
- Escreva com clareza e reverência, em tom editorial, sem jargão exagerado.
- Corrija erros óbvios de transcrição ao citar nomes bíblicos, lugares e termos.

Campos:
- title: título curto e marcante (até ~8 palavras), sem aspas.
- main_topic: o tópico principal da palavra em UMA frase.
- summary: de 3 a 5 parágrafos, cada um com 3 a 6 frases, narrando o desenvolvimento da mensagem.
- verses: TODAS as passagens bíblicas citadas ou lidas, na ordem em que aparecem, sem repetir.
  · book: use exatamente um destes nomes: ${BOOK_NAMES.join(", ")}.
  · chapter: número do capítulo.
  · verses: versículo ou intervalo ("16", "28-30", "1-3,5"); vazio se o capítulo inteiro foi referido.
  · reference: forma legível, ex. "Romanos 8:28-30".
  · text: o texto do(s) versículo(s) na tradução Almeida Revista e Atualizada. Se for um intervalo muito longo (mais de 6 versículos), traga só os versículos centrais e termine com "…".
  Se o pregador só aludiu a uma passagem sem identificá-la com segurança, não a inclua.
- key_points: de 3 a 5 pontos principais / lições práticas; title curto (até ~8 palavras) e description com 1 a 3 frases.
- quotes: de 3 a 6 frases marcantes ditas pelo pregador, o mais próximo possível das palavras originais (limpe apenas vícios de linguagem e erros de transcrição). Sem aspas no início/fim.`;

export const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "main_topic", "summary", "verses", "key_points", "quotes"],
  properties: {
    title: { type: "string" },
    main_topic: { type: "string" },
    summary: { type: "array", items: { type: "string" } },
    verses: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["reference", "book", "chapter", "verses", "text"],
        properties: {
          reference: { type: "string" },
          book: { type: "string" },
          chapter: { type: "integer" },
          verses: { type: "string" },
          text: { type: "string" },
        },
      },
    },
    key_points: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
      },
    },
    quotes: { type: "array", items: { type: "string" } },
  },
} as const;

export type PromptInput = { transcript: string; category: Category; preacher?: string; series?: string | null };

export function contextLine(input: PromptInput) {
  const kind = input.category === "pregacao" ? "uma pregação de culto de domingo" : "um estudo bíblico";
  return [`Tipo: ${kind}.`, input.preacher ? `Pregador: ${input.preacher}.` : "", input.series ? `Série: ${input.series}.` : ""]
    .filter(Boolean)
    .join(" ");
}

const JSON_EXAMPLE = `{
  "title": "...",
  "main_topic": "...",
  "summary": ["parágrafo 1", "parágrafo 2", "parágrafo 3"],
  "verses": [{ "reference": "Romanos 8:28", "book": "Romanos", "chapter": 8, "verses": "28", "text": "..." }],
  "key_points": [{ "title": "...", "description": "..." }],
  "quotes": ["...", "..."]
}`;

/** Pedido completo para colar no claude.ai (modo grátis). */
export function buildManualPrompt(input: PromptInput) {
  return `${SYSTEM_PROMPT}

Formato da resposta: responda APENAS com um objeto JSON válido, dentro de um bloco de código \`\`\`json, sem nenhum texto antes ou depois, exatamente com esta estrutura:
${JSON_EXAMPLE}

${contextLine(input)}

<transcricao>
${input.transcript}
</transcricao>

Gere o registro editorial desta mensagem no formato JSON acima.`;
}

/** Interpreta a resposta da IA (aceita JSON puro ou dentro de bloco de código). */
export function parseAiText(text: string): AiResult {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("Não encontrei o JSON na resposta. Copie a resposta inteira do Claude.");

  let raw: Partial<AiResult>;
  try {
    raw = JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new Error("A resposta não é um JSON válido. Copie a resposta inteira do Claude, de { até }.");
  }

  const summary = Array.isArray(raw.summary)
    ? raw.summary
    : String(raw.summary ?? "").split(/\n\s*\n/);

  return {
    title: String(raw.title ?? "").trim(),
    main_topic: String(raw.main_topic ?? "").trim(),
    summary: summary.map((p) => String(p).trim()).filter(Boolean),
    verses: normalizeVerses(Array.isArray(raw.verses) ? raw.verses : []),
    key_points: (Array.isArray(raw.key_points) ? raw.key_points : [])
      .map((k) => ({ title: String(k?.title ?? "").trim(), description: String(k?.description ?? "").trim() }))
      .filter((k) => k.title || k.description),
    quotes: (Array.isArray(raw.quotes) ? raw.quotes : [])
      .map((q) => String(q).trim().replace(/^["“]|["”]$/g, ""))
      .filter(Boolean),
  };
}

function normalizeVerses(list: Verse[]): Verse[] {
  const seen = new Set<string>();
  const out: Verse[] = [];
  for (const v of list) {
    if (!v) continue;
    const book = canonicalBook(String(v.book ?? "")) ?? String(v.book ?? "").trim();
    const verses = String(v.verses ?? "").trim();
    const chapter = Number(v.chapter) || 0;
    const reference = chapter ? `${book} ${chapter}${verses ? `:${verses}` : ""}` : String(v.reference ?? "").trim();
    if (!reference || seen.has(reference)) continue;
    seen.add(reference);
    out.push({ book, chapter, verses, reference, text: String(v.text ?? "").trim() });
  }
  return out;
}
