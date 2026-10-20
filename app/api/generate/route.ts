import { NextResponse } from "next/server";
import { db } from "@/lib/supabase/server";
import { generateFromTranscript, MAX_TRANSCRIPT_CHARS } from "@/lib/ai";
import type { Category } from "@/lib/types";
import { uniqueSlug } from "@/lib/utils";

export const runtime = "nodejs";
// Pregações longas podem levar alguns minutos para processar.
export const maxDuration = 300;

type Body = {
  transcript?: string;
  category?: Category;
  date?: string;
  preacher?: string;
  series?: string;
};

/**
 * Recebe a transcrição, cria um registro "processando" e devolve o progresso
 * em tempo real (NDJSON: uma linha JSON por evento). O processamento continua
 * no servidor mesmo que a aba seja fechada; o resultado é salvo como rascunho.
 */
export async function POST(request: Request) {
  const supabase = db();

  const body = (await request.json()) as Body;
  const transcript = (body.transcript ?? "").trim();
  const category: Category = body.category === "estudo" ? "estudo" : "pregacao";

  if (transcript.length < 200) {
    return NextResponse.json({ error: "A transcrição está muito curta." }, { status: 400 });
  }
  if (transcript.length > MAX_TRANSCRIPT_CHARS) {
    return NextResponse.json({ error: "A transcrição excede o tamanho máximo suportado." }, { status: 400 });
  }

  const { data: row, error } = await supabase
    .from("messages")
    .insert({
      slug: uniqueSlug("processando"),
      status: "processing",
      category,
      date: body.date || new Date().toISOString().slice(0, 10),
      preacher: (body.preacher ?? "").trim(),
      series: (body.series ?? "").trim() || null,
      transcript,
    })
    .select("id")
    .single();

  if (error || !row) {
    return NextResponse.json({ error: "Não foi possível criar o registro: " + (error?.message ?? "") }, { status: 500 });
  }

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
        } catch {
          closed = true; // cliente desconectou — o trabalho continua
        }
      };

      // Mantém a conexão viva enquanto a IA "pensa".
      const heartbeat = setInterval(() => send({ type: "ping" }), 10000);

      try {
        send({ type: "progress", stage: "Registro criado", percent: 4, id: row.id });

        const result = await generateFromTranscript(
          { transcript, category, preacher: body.preacher, series: body.series },
          (stage, percent) => send({ type: "progress", stage, percent }),
        );

        send({ type: "progress", stage: "Salvando rascunho", percent: 96 });

        const books = [...new Set(result.verses.map((v) => v.book).filter(Boolean))];
        const { error: upErr } = await supabase
          .from("messages")
          .update({
            status: "draft",
            slug: uniqueSlug(result.title),
            title: result.title,
            main_topic: result.main_topic,
            summary: result.summary.join("\n\n"),
            verses: result.verses,
            key_points: result.key_points,
            quotes: result.quotes,
            books,
            error: null,
          })
          .eq("id", row.id);
        if (upErr) throw new Error("Falha ao salvar o rascunho: " + upErr.message);

        send({ type: "done", id: row.id });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Erro desconhecido ao gerar o resumo.";
        console.error("[generate]", e);
        await supabase.from("messages").update({ status: "error", error: message }).eq("id", row.id);
        send({ type: "error", error: message, id: row.id });
      } finally {
        clearInterval(heartbeat);
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {}
        }
      }
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
