"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { buildManualPrompt } from "@/lib/prompt";
import type { Category } from "@/lib/types";
import { cn, todayISO, wordCount } from "@/lib/utils";
import { createFromManual } from "../actions";

type Phase = "form" | "running" | "error" | "manual";

export function NewMessageForm({
  preachers,
  series,
  auto,
}: {
  preachers: string[];
  series: string[];
  auto: boolean;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [transcript, setTranscript] = useState("");
  const [category, setCategory] = useState<Category>("pregacao");
  const [date, setDate] = useState(todayISO());
  const [preacher, setPreacher] = useState("");
  const [serie, setSerie] = useState("");

  const [fileName, setFileName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [phase, setPhase] = useState<Phase>("form");
  const [stage, setStage] = useState("");
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const [aiText, setAiText] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const words = wordCount(transcript);

  async function copyPrompt() {
    const prompt = buildManualPrompt({ transcript, category, preacher, series: serie });
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Navegadores sem permissão de área de transferência: seleciona um campo temporário
      const ta = document.createElement("textarea");
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 4000);
  }

  async function saveManual() {
    setError("");
    setSaving(true);
    const res = await createFromManual({ transcript, category, date, preacher, series: serie, aiText });
    if (res.error || !res.id) {
      setError(res.error ?? "Erro ao salvar.");
      setSaving(false);
      return;
    }
    router.push(`/painel/${res.id}`);
  }

  function start() {
    setError("");
    if (words < 40) {
      setError("A transcrição está muito curta.");
      return;
    }
    if (auto) generate();
    else {
      setPhase("manual");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleFile(file: File) {
    setError("");
    setFileName(file.name);
    setExtracting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao ler o arquivo.");
      setTranscript(data.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao ler o arquivo.");
      setFileName("");
    } finally {
      setExtracting(false);
    }
  }

  async function generate() {
    setError("");
    if (words < 40) {
      setError("A transcrição está muito curta.");
      return;
    }
    setPhase("running");
    setStage("Preparando");
    setPercent(2);
    setElapsed(0);
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, category, date, preacher, series: serie }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erro ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let doneId: string | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line);
          if (ev.type === "progress") {
            setStage(ev.stage);
            setPercent((p) => Math.max(p, ev.percent));
          } else if (ev.type === "error") {
            throw new Error(ev.error);
          } else if (ev.type === "done") {
            doneId = ev.id;
          }
        }
      }

      if (!doneId) throw new Error("A conexão foi interrompida. Veja o status na lista do painel.");
      setPercent(100);
      setStage("Pronto! Abrindo revisão…");
      router.push(`/painel/${doneId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar o resumo.");
      setPhase("error");
    } finally {
      clearInterval(timer);
    }
  }

  if (phase === "manual") {
    return (
      <div className="mt-10 space-y-6">
        <section className="glass p-6 sm:p-8">
          <p className="eyebrow">Passo 1</p>
          <h2 className="mt-3 text-2xl font-light">
            Copie o pedido e cole no <span className="em">Claude</span>
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-stone">
            O pedido já inclui as instruções e a transcrição inteira. Abra o claude.ai (pode ser a conta grátis),
            cole numa conversa nova e envie.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={copyPrompt} className="btn-light">
              {copied ? "✓ Copiado" : "Copiar pedido"}
            </button>
            <a href="https://claude.ai/new" target="_blank" rel="noreferrer" className="btn-outline">
              Abrir claude.ai ↗
            </a>
          </div>
        </section>

        <section className="glass p-6 sm:p-8">
          <p className="eyebrow">Passo 2</p>
          <h2 className="mt-3 text-2xl font-light">
            Cole aqui a <span className="em">resposta</span>
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-stone">
            Quando o Claude terminar, clique em copiar na resposta dele e cole abaixo.
          </p>
          <textarea
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            rows={12}
            placeholder='{ "title": "...", ... }'
            className="field mt-6 resize-y font-mono text-[13px]"
          />
        </section>

        {error && (
          <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-[14px] text-red-200">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button type="button" onClick={() => setPhase("form")} className="btn-ghost sm:mr-auto">
            ← Voltar
          </button>
          <button
            type="button"
            onClick={saveManual}
            disabled={saving || aiText.trim().length < 20}
            className="btn-light !px-8 !py-3.5"
          >
            {saving ? "Criando…" : "Criar rascunho"}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "running") {
    return (
      <div className="glass mt-10 p-8 sm:p-12">
        <p className="eyebrow">Gerando resumo</p>
        <p className="display mt-4 text-3xl sm:text-4xl">
          {stage}
          <span className="em">…</span>
        </p>
        <div className="mt-10 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-warm/70 to-cream transition-[width] duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-4 flex justify-between text-[12px] text-stone">
          <span>{percent}%</span>
          <span>
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-10 max-w-lg text-[14px] leading-relaxed text-stone">
          Transcrições longas podem levar alguns minutos. Pode continuar usando o site — o processamento segue no
          servidor e o rascunho aparece na lista do painel quando terminar.
        </p>
        <button type="button" onClick={() => router.push("/painel")} className="btn-outline mt-8">
          Ir para a lista
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-8">
      {/* Transcrição */}
      <section className="glass p-5 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="transcript" className="label !mb-0">
            Transcrição
          </label>
          <span className="text-[12px] text-stone">
            {words.toLocaleString("pt-BR")} palavras
            {words > 0 && ` · ~${Math.max(1, Math.round(words / 140))} min de fala`}
          </span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={cn(
            "mb-4 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-7 text-center transition-colors",
            dragOver ? "border-cream/60 bg-white/[0.05]" : "border-white/15",
          )}
        >
          <p className="text-[14px] text-cream/80">
            {extracting ? `Lendo ${fileName}…` : fileName ? `Arquivo: ${fileName}` : "Arraste um arquivo aqui"}
          </p>
          <button
            type="button"
            disabled={extracting}
            onClick={() => fileInput.current?.click()}
            className="btn-outline !py-2"
          >
            Escolher .txt, .docx ou .pdf
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".txt,.docx,.pdf,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </div>

        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="…ou cole aqui o texto da transcrição"
          rows={14}
          className="field min-h-[280px] resize-y font-sans leading-relaxed"
        />
      </section>

      {/* Informações */}
      <section className="glass grid gap-6 p-5 sm:grid-cols-2 sm:p-8">
        <div className="sm:col-span-2">
          <span className="label">Categoria</span>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["pregacao", "Pregação", "Culto de domingo"],
                ["estudo", "Estudo", "Estudo bíblico na semana"],
              ] as const
            ).map(([value, label, hint]) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  category === value ? "border-cream/60 bg-white/[0.06]" : "border-white/10 hover:border-white/25",
                )}
                aria-pressed={category === value}
              >
                <span className="block text-[16px] text-cream">{label}</span>
                <span className="mt-1 block text-[12px] text-stone">{hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="date" className="label">
            Data
          </label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field" />
        </div>
        <div>
          <label htmlFor="preacher" className="label">
            Pregador
          </label>
          <input
            id="preacher"
            list="preachers"
            value={preacher}
            onChange={(e) => setPreacher(e.target.value)}
            placeholder="Nome do pregador"
            className="field"
          />
          <datalist id="preachers">
            {preachers.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="serie" className="label">
            Série <span className="normal-case tracking-normal text-stone-dim">(opcional)</span>
          </label>
          <input
            id="serie"
            list="series"
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            placeholder='Ex.: "Estudo em Romanos"'
            className="field"
          />
          <datalist id="series">
            {series.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-[14px] text-red-200">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <p className="text-[12px] text-stone sm:mr-auto">O resultado fica como rascunho até você publicar.</p>
        <button type="button" onClick={start} disabled={extracting || words < 40} className="btn-light !px-8 !py-3.5">
          {auto ? "Gerar resumo" : "Continuar"}
        </button>
      </div>
    </div>
  );
}
