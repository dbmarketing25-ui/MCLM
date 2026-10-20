import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { AiResult } from "@/lib/types";
import { fetchVerseText } from "@/lib/bible";
import { contextLine, OUTPUT_SCHEMA, parseAiText, SYSTEM_PROMPT, type PromptInput } from "@/lib/prompt";

/** Limite de segurança (~1M de tokens de contexto; 1h de pregação dá ~60 mil caracteres). */
export const MAX_TRANSCRIPT_CHARS = 1_500_000;

/** Modo automático disponível? Sem chave, o painel usa o modo manual (grátis, via claude.ai). */
export function aiEnabled() {
  return !!process.env.ANTHROPIC_API_KEY;
}

export type ProgressFn = (stage: string, percent: number) => void;

// Tamanho típico da resposta em caracteres — usado só para estimar o progresso.
const EXPECTED_OUTPUT_CHARS = 7000;

export async function generateFromTranscript(input: PromptInput, onProgress: ProgressFn): Promise<AiResult> {
  if (!aiEnabled()) {
    throw new Error("ANTHROPIC_API_KEY não configurada no servidor.");
  }
  const client = new Anthropic();

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
        content: `${contextLine(input)}\n\n<transcricao>\n${input.transcript}\n</transcricao>\n\nGere o registro editorial desta mensagem.`,
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

  const result = parseAiText(text);
  onProgress("Conferindo versículos", 90);
  await fillExactVerses(result);
  return result;
}

/** Se BIBLE_TEXT_SOURCE=bible-api, troca o texto dos versículos pelo texto exato da Almeida. */
export async function fillExactVerses(result: AiResult) {
  if (process.env.BIBLE_TEXT_SOURCE !== "bible-api") return;
  await Promise.all(
    result.verses.map(async (v) => {
      const exact = await fetchVerseText(v);
      if (exact) v.text = exact;
    }),
  );
}
