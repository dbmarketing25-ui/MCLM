import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { AiResult, Category, Verse } from "@/lib/types";
import { BOOK_NAMES, canonicalBook, fetchVerseText } from "@/lib/bible";

/** Limite de segurança (~1M de tokens de contexto; 1h de pregação dá ~60 mil caracteres). */
export const MAX_TRANSCRIPT_CHARS = 1_500_000;

const SYSTEM_PROMPT = `Você é um assistente editorial de uma igreja evangélica brasileira. Recebe a transcrição (feita por software, com erros de reconhecimento de fala) de uma pregação de culto de domingo ou de um estudo bíblico, e produz um registro fiel e bem escrito em português do Brasil.

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

const OUTPUT_SCHEMA = {
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

export type ProgressFn = (stage: string, percent: number) => void;

// Tamanho típico da resposta em caracteres — usado só para estimar o progresso.
const EXPECTED_OUTPUT_CHARS = 7000;

export async function generateFromTranscript(
  input: { transcript: string; category: Category; preacher?: string; series?: string | null },
  onProgress: ProgressFn,
): Promise<AiResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY não configurada no servidor.");
  }
  const client = new Anthropic();

  const kind = input.category === "pregacao" ? "uma pregação de culto de domingo" : "um estudo bíblico";
  const context = [
    `Tipo: ${kind}.`,
    input.preacher ? `Pregador: ${input.preacher}.` : "",
    input.series ? `Série: ${input.series}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  onProgress("Enviando transcrição para a IA", 8);

  const params = {
    model: process.env.AI_MODEL || "claude-opus-5-5",
    max_tokens: 32000,
    system: SYSTEM_PROMPT,
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: OUTPUT_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `${context}\n\n<transcricao>\n${input.transcript}\n</transcricao>\n\nGere o registro editorial desta mensagem.`,
      },
    ],
    // Se o modelo principal recusar por um falso positivo de segurança, a API refaz
    // automaticamente a chamada com um modelo alternativo.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  };

  const stream = client.beta.messages.stream(
    params as unknown as Parameters<typeof client.beta.messages.stream>[0],
  );

  let chars = 0;
  let writing = false;
  for await (const event of stream) {
    if (event.type === "content_block_start" && event.content_block.type === "thinking") {
      onProgress("Lendo e analisando a mensagem", 15);
    }
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      if (!writing) {
        writing = true;
        onProgress("Escrevendo resumo, versículos e pontos", 25);
      }
      chars += event.delta.text.length;
      const pct = 25 + Math.min(60, (chars / EXPECTED_OUTPUT_CHARS) * 60);
      onProgress("Escrevendo resumo, versículos e pontos", Math.round(pct));
    }
  }

  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new Error("A IA recusou processar este texto. Revise a transcrição e tente novamente.");
  }
  if (message.stop_reason === "max_tokens") {
    throw new Error("A resposta da IA foi cortada por ser longa demais. Tente novamente.");
  }

  const text = message.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();

  let raw: AiResult;
  try {
    raw = JSON.parse(text) as AiResult;
  } catch {
    throw new Error("Não foi possível interpretar a resposta da IA. Tente novamente.");
  }

  onProgress("Conferindo versículos", 90);
  const verses = await normalizeVerses(raw.verses ?? []);

  return {
    title: String(raw.title ?? "").trim(),
    main_topic: String(raw.main_topic ?? "").trim(),
    summary: (raw.summary ?? []).map((p) => String(p).trim()).filter(Boolean),
    verses,
    key_points: (raw.key_points ?? [])
      .map((k) => ({ title: String(k.title ?? "").trim(), description: String(k.description ?? "").trim() }))
      .filter((k) => k.title || k.description),
    quotes: (raw.quotes ?? []).map((q) => String(q).trim().replace(/^["“]|["”]$/g, "")).filter(Boolean),
  };
}

async function normalizeVerses(list: Verse[]): Promise<Verse[]> {
  const useApi = process.env.BIBLE_TEXT_SOURCE === "bible-api";
  const seen = new Set<string>();
  const out: Verse[] = [];

  for (const v of list) {
    const book = canonicalBook(v.book) ?? v.book;
    const verses = String(v.verses ?? "").trim();
    const chapter = Number(v.chapter) || 0;
    const reference = chapter ? `${book} ${chapter}${verses ? `:${verses}` : ""}` : v.reference;
    if (seen.has(reference)) continue;
    seen.add(reference);
    out.push({ book, chapter, verses, reference, text: String(v.text ?? "").trim() });
  }

  if (useApi) {
    await Promise.all(
      out.map(async (v) => {
        const exact = await fetchVerseText(v);
        if (exact) v.text = exact;
      }),
    );
  }
  return out;
}
