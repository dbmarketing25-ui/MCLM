import Link from "next/link";
import { Photo } from "@/components/Photo";
import { site } from "@/lib/config";
import { CATEGORY_LABEL, type MessageCard as Card } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

export function MessageCard({ m, className, compact }: { m: Card; className?: string; compact?: boolean }) {
  const img = m.category === "pregacao" ? site.images.pregacoes : site.images.estudos;
  return (
    <Link
      href={`/mensagem/${m.slug}`}
      className={cn(
        "group glass flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]",
        className,
      )}
    >
      <Photo src={img} className={cn("w-full", compact ? "aspect-[16/9]" : "aspect-[4/3]")}>
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-5">
          <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cream/90 backdrop-blur-md">
            {CATEGORY_LABEL[m.category].singular}
          </span>
          <span className="text-[11px] uppercase tracking-[0.16em] text-cream/75">{formatDate(m.date, "short")}</span>
        </div>
      </Photo>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {m.series && <p className="eyebrow mb-3 !text-amber-warm/90">{m.series}</p>}
        <h3 className="text-balance text-xl font-light leading-snug tracking-tight text-cream">{m.title}</h3>
        {m.main_topic && (
          <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-stone">{m.main_topic}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="text-[13px] text-cream/70">{m.preacher}</span>
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-cream/80 transition-all duration-300 group-hover:border-white/40 group-hover:bg-cream group-hover:text-ink-900"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
