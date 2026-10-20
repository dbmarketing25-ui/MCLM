"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Category, KeyPoint, Message, Verse } from "@/lib/types";
import { cn, wordCount } from "@/lib/utils";
import { saveMessage } from "../actions";
import { DeleteButton } from "../DeleteButton";

export function MessageEditor({ message: m }: { message: Message }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  const [title, setTitle] = useState(m.title);
  const [category, setCategory] = useState<Category>(m.category);
  const [date, setDate] = useState(m.date);
  const [preacher, setPreacher] = useState(m.preacher);
  const [series, setSeries] = useState(m.series ?? "");
  const [mainTopic, setMainTopic] = useState(m.main_topic);
  const [summary, setSummary] = useState(m.summary);
  const [verses, setVerses] = useState<Verse[]>(m.verses ?? []);
  const [points, setPoints] = useState<KeyPoint[]>(m.key_points ?? []);
  const [quotes, setQuotes] = useState<string[]>(m.quotes ?? []);
  const [transcript, setTranscript] = useState(m.transcript);
  const [showTranscript, setShowTranscript] = useState(false);

  // Aviso ao sair com alterações não salvas
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const touch =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setDirty(true);
    };

  function save(status: "draft" | "published") {
    setNotice(null);
    startTransition(async () => {
      const res = await saveMessage({
        id: m.id,
        status,
        category,
        title,
        date,
        preacher,
        series,
        main_topic: mainTopic,
        summary,
        verses,
        key_points: points,
        quotes,
        transcript,
      });
      if (res.error) {
        setNotice({ kind: "error", text: res.error });
        return;
      }
      setDirty(false);
      if (status === "published") {
        router.push(`/mensagem/${res.slug}`);
      } else {
        setNotice({ kind: "ok", text: "Rascunho salvo." });
        router.refresh();
      }
    });
  }

  const isPublished = m.status === "published";

  return (
    <div className="mx-auto max-w-4xl pb-32">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/painel" className="eyebrow hover:text-cream">
            ← Painel
          </Link>
          <h1 className="display mt-4 text-4xl sm:text-5xl">
            Revisar <span className="em">e editar</span>
          </h1>
          <p className="mt-3 text-[14px] text-stone">
            Status atual:{" "}
            <span className="text-cream">
              {
                { published: "Publicado", draft: "Rascunho", processing: "Processando", error: "Erro" }[
                  m.status
                ]
              }
            </span>
            {m.status === "error" && m.error && <span className="text-red-300"> — {m.error}</span>}
          </p>
        </div>
        <DeleteButton id={m.id} title={m.title} className="btn-danger self-start !py-2" />
      </div>

      <div className="mt-10 space-y-6">
        {/* Informações */}
        <Card title="Informações">
          <Field label="Título">
            <input value={title} onChange={(e) => touch(setTitle)(e.target.value)} className="field text-lg" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Categoria">
              <select value={category} onChange={(e) => touch(setCategory)(e.target.value as Category)} className="field">
                <option value="pregacao">Pregação</option>
                <option value="estudo">Estudo</option>
              </select>
            </Field>
            <Field label="Data">
              <input type="date" value={date} onChange={(e) => touch(setDate)(e.target.value)} className="field" />
            </Field>
            <Field label="Pregador">
              <input value={preacher} onChange={(e) => touch(setPreacher)(e.target.value)} className="field" />
            </Field>
            <Field label="Série (opcional)">
              <input value={series} onChange={(e) => touch(setSeries)(e.target.value)} className="field" />
            </Field>
          </div>
        </Card>

        <Card title="Tópico principal" hint="Uma frase que resume a palavra.">
          <textarea
            value={mainTopic}
            onChange={(e) => touch(setMainTopic)(e.target.value)}
            rows={2}
            className="field font-serif text-xl italic"
          />
        </Card>

        <Card title="Resumo" hint="3 a 5 parágrafos. Separe os parágrafos com uma linha em branco.">
          <textarea
            value={summary}
            onChange={(e) => touch(setSummary)(e.target.value)}
            rows={14}
            className="field resize-y leading-relaxed"
          />
        </Card>

        {/* Versículos */}
        <Card title="Passagens bíblicas" hint='Use o formato "Livro capítulo:versículos", ex.: Romanos 8:28-30.'>
          <div className="space-y-4">
            {verses.map((v, i) => (
              <div key={i} className="rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-2">
                  <input
                    value={v.reference}
                    onChange={(e) =>
                      touch(setVerses)(verses.map((x, j) => (j === i ? { ...x, reference: e.target.value } : x)))
                    }
                    placeholder="Referência"
                    className="field !py-2 font-medium"
                  />
                  <RowActions
                    onUp={i > 0 ? () => touch(setVerses)(move(verses, i, -1)) : undefined}
                    onDown={i < verses.length - 1 ? () => touch(setVerses)(move(verses, i, 1)) : undefined}
                    onRemove={() => touch(setVerses)(verses.filter((_, j) => j !== i))}
                  />
                </div>
                <textarea
                  value={v.text}
                  onChange={(e) => touch(setVerses)(verses.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                  placeholder="Texto do versículo"
                  rows={3}
                  className="field mt-3 font-serif text-[17px] italic leading-relaxed"
                />
              </div>
            ))}
            <AddButton
              onClick={() =>
                touch(setVerses)([...verses, { reference: "", book: "", chapter: 0, verses: "", text: "" }])
              }
            >
              Adicionar passagem
            </AddButton>
          </div>
        </Card>

        {/* Pontos */}
        <Card title="Pontos principais" hint="3 a 5 lições práticas.">
          <div className="space-y-4">
            {points.map((p, i) => (
              <div key={i} className="rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <span className="em w-8 shrink-0 text-2xl text-amber-warm/80">{String(i + 1).padStart(2, "0")}</span>
                  <input
                    value={p.title}
                    onChange={(e) => touch(setPoints)(points.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                    placeholder="Título do ponto"
                    className="field !py-2"
                  />
                  <RowActions
                    onUp={i > 0 ? () => touch(setPoints)(move(points, i, -1)) : undefined}
                    onDown={i < points.length - 1 ? () => touch(setPoints)(move(points, i, 1)) : undefined}
                    onRemove={() => touch(setPoints)(points.filter((_, j) => j !== i))}
                  />
                </div>
                <textarea
                  value={p.description}
                  onChange={(e) =>
                    touch(setPoints)(points.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))
                  }
                  placeholder="Descrição"
                  rows={2}
                  className="field mt-3"
                />
              </div>
            ))}
            <AddButton onClick={() => touch(setPoints)([...points, { title: "", description: "" }])}>
              Adicionar ponto
            </AddButton>
          </div>
        </Card>

        {/* Frases */}
        <Card title="Frases marcantes">
          <div className="space-y-3">
            {quotes.map((q, i) => (
              <div key={i} className="flex items-start gap-2">
                <textarea
                  value={q}
                  onChange={(e) => touch(setQuotes)(quotes.map((x, j) => (j === i ? e.target.value : x)))}
                  rows={2}
                  className="field font-serif text-[17px] italic"
                />
                <RowActions
                  onUp={i > 0 ? () => touch(setQuotes)(move(quotes, i, -1)) : undefined}
                  onDown={i < quotes.length - 1 ? () => touch(setQuotes)(move(quotes, i, 1)) : undefined}
                  onRemove={() => touch(setQuotes)(quotes.filter((_, j) => j !== i))}
                />
              </div>
            ))}
            <AddButton onClick={() => touch(setQuotes)([...quotes, ""])}>Adicionar frase</AddButton>
          </div>
        </Card>

        {/* Transcrição */}
        <Card
          title="Transcrição original"
          hint={`${wordCount(transcript).toLocaleString("pt-BR")} palavras`}
          action={
            <button type="button" onClick={() => setShowTranscript((v) => !v)} className="btn-ghost !px-0">
              {showTranscript ? "Ocultar" : "Mostrar"}
            </button>
          }
        >
          {showTranscript && (
            <textarea
              value={transcript}
              onChange={(e) => touch(setTranscript)(e.target.value)}
              rows={18}
              className="field resize-y text-[14px] leading-relaxed"
            />
          )}
        </Card>
      </div>

      {/* Barra de ações fixa */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-ink-900/85 backdrop-blur-xl">
        <div className="container-x flex max-w-4xl flex-wrap items-center gap-3 py-4">
          <p
            className={cn(
              "mr-auto text-[13px]",
              notice?.kind === "error" ? "text-red-300" : notice ? "text-emerald-200" : "text-stone",
            )}
          >
            {pending ? "Salvando…" : notice?.text ?? (dirty ? "Alterações não salvas" : "Tudo salvo")}
          </p>
          <button type="button" disabled={pending} onClick={() => save("draft")} className="btn-outline">
            {isPublished ? "Despublicar" : "Salvar rascunho"}
          </button>
          <button type="button" disabled={pending} onClick={() => save("published")} className="btn-light">
            {isPublished ? "Salvar publicação" : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const next = [...arr];
  [next[i], next[i + dir]] = [next[i + dir], next[i]];
  return next;
}

function Card({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="glass space-y-5 p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-cream">{title}</h2>
          {hint && <p className="mt-1.5 text-[13px] text-stone">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function RowActions({ onUp, onDown, onRemove }: { onUp?: () => void; onDown?: () => void; onRemove: () => void }) {
  const cls =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-stone transition-colors hover:border-white/30 hover:text-cream disabled:opacity-25";
  return (
    <div className="flex shrink-0 gap-1">
      <button type="button" onClick={onUp} disabled={!onUp} className={cls} aria-label="Mover para cima">
        ↑
      </button>
      <button type="button" onClick={onDown} disabled={!onDown} className={cls} aria-label="Mover para baixo">
        ↓
      </button>
      <button type="button" onClick={onRemove} className={cn(cls, "hover:!text-red-300")} aria-label="Remover">
        ×
      </button>
    </div>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-dashed border-white/15 py-3 text-[12px] uppercase tracking-[0.16em] text-stone transition-colors hover:border-white/35 hover:text-cream"
    >
      + {children}
    </button>
  );
}
