import { cn } from "@/lib/utils";

/** Título de seção: sans-serif leve com palavra-chave em itálico serifado. */
export function SectionTitle({
  eyebrow,
  lead,
  emphasis,
  tail,
  center,
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  lead: string;
  emphasis?: string;
  tail?: string;
  center?: boolean;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn(center && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
      <Tag
        className={cn(
          "display text-balance leading-[1.05] text-cream",
          Tag === "h1" ? "text-[44px] sm:text-6xl lg:text-7xl" : "text-[34px] sm:text-5xl",
        )}
      >
        {lead} {emphasis && <span className="em">{emphasis}</span>}
        {tail ? ` ${tail}` : null}
      </Tag>
    </div>
  );
}
