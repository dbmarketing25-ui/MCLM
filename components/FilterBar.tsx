"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

type Options = { preachers: string[]; series: string[]; books: string[] };

export function FilterBar({ options, total }: { options: Options; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  // Busca com pequeno atraso enquanto digita
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (q === current) return;
    const t = setTimeout(() => update("q", q.trim()), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const active = ["pregador", "serie", "livro", "q"].some((k) => params.get(k));

  return (
    <div className={cn("glass-strong p-4 transition-opacity sm:p-5", pending && "opacity-70")}>
      <div className="grid gap-3 md:grid-cols-12">
        <div className="relative md:col-span-6">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por palavra-chave"
            className="field !pl-11"
            aria-label="Buscar por palavra-chave"
          />
        </div>
        <Select label="Pregador" value={params.get("pregador") ?? ""} options={options.preachers} onChange={(v) => update("pregador", v)} />
        <Select label="Série" value={params.get("serie") ?? ""} options={options.series} onChange={(v) => update("serie", v)} />
        <Select label="Livro" value={params.get("livro") ?? ""} options={options.books} onChange={(v) => update("livro", v)} />
      </div>
      <div className="mt-4 flex items-center justify-between px-1 text-[12px] text-stone">
        <span>
          {pending ? "Buscando…" : `${total} ${total === 1 ? "mensagem encontrada" : "mensagens encontradas"}`}
        </span>
        {active && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
            className="uppercase tracking-[0.16em] hover:text-cream"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative md:col-span-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="field appearance-none !pr-10"
      >
        <option value="">{label}: todos</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone">
        ▾
      </span>
    </div>
  );
}
