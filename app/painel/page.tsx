import Link from "next/link";
import { db } from "@/lib/supabase/server";
import { CATEGORY_LABEL, type Category, type Status } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { DeleteButton } from "./DeleteButton";
import { AutoRefresh } from "./AutoRefresh";

type Row = {
  id: string;
  slug: string;
  title: string;
  category: Category;
  status: Status;
  date: string;
  preacher: string;
  series: string | null;
  error: string | null;
  updated_at: string;
};

const STATUS: Record<Status, { label: string; cls: string }> = {
  published: { label: "Publicado", cls: "border-emerald-300/25 text-emerald-200 bg-emerald-300/10" },
  draft: { label: "Rascunho", cls: "border-amber-200/25 text-amber-100 bg-amber-200/10" },
  processing: { label: "Processando", cls: "border-sky-300/25 text-sky-200 bg-sky-300/10 animate-pulse" },
  error: { label: "Erro", cls: "border-red-300/25 text-red-200 bg-red-300/10" },
};

const TABS = [
  { key: "", label: "Todas" },
  { key: "pregacao", label: "Pregações" },
  { key: "estudo", label: "Estudos" },
  { key: "draft", label: "Rascunhos" },
];

export default async function PainelPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const supabase = db();
  const { f = "" } = await searchParams;

  let query = supabase
    .from("messages")
    .select("id, slug, title, category, status, date, preacher, series, error, updated_at")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (f === "pregacao" || f === "estudo") query = query.eq("category", f);
  if (f === "draft") query = query.in("status", ["draft", "processing", "error"]);

  const { data, error } = await query;
  const rows = (data ?? []) as Row[];
  const hasProcessing = rows.some((r) => r.status === "processing");

  return (
    <div>
      {hasProcessing && <AutoRefresh />}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Painel</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">
            Todas as <span className="em">mensagens</span>
          </h1>
        </div>
        <Link href="/painel/nova" className="btn-light self-start sm:self-auto">
          + Enviar transcrição
        </Link>
      </div>

      <div className="no-scrollbar mt-10 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/painel?f=${t.key}` : "/painel"}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-[12px] uppercase tracking-[0.14em] transition-colors",
              f === t.key ? "border-cream bg-cream text-ink-900" : "border-white/15 text-stone hover:text-cream",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {error && (
        <p className="mt-8 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          Erro ao carregar: {error.message}. Verifique se o arquivo supabase/schema.sql foi executado.
        </p>
      )}

      {rows.length === 0 ? (
        <div className="glass mt-8 p-12 text-center">
          <p className="em text-2xl">Nenhuma mensagem por aqui</p>
          <p className="mt-3 text-sm text-stone">Envie uma transcrição para começar o acervo.</p>
        </div>
      ) : (
        <ul className="glass mt-8 divide-y divide-white/[0.06] overflow-hidden">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-4 p-5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-6 sm:px-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em]", STATUS[r.status].cls)}>
                    {STATUS[r.status].label}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-stone">
                    {CATEGORY_LABEL[r.category].singular} · {formatDate(r.date, "short")}
                  </span>
                </div>
                <p className="mt-2 truncate text-lg font-light text-cream">
                  {r.title || (r.status === "processing" ? "Gerando resumo…" : "Sem título")}
                </p>
                <p className="mt-0.5 truncate text-[13px] text-stone">
                  {[r.preacher, r.series].filter(Boolean).join(" · ") || "—"}
                </p>
                {r.status === "error" && r.error && <p className="mt-2 text-[13px] text-red-300">{r.error}</p>}
              </div>
              <div className="flex items-center gap-1 sm:shrink-0">
                {r.status === "published" && (
                  <Link href={`/mensagem/${r.slug}`} className="btn-ghost !px-2">
                    Ver
                  </Link>
                )}
                <Link href={`/painel/${r.id}`} className="btn-outline !px-4 !py-2">
                  Editar
                </Link>
                <DeleteButton id={r.id} title={r.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
