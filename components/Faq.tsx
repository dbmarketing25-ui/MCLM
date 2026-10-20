import { site } from "@/lib/config";

export function Faq() {
  return (
    <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
      {site.faq.map((item, i) => (
        <details key={i} className="group py-1" open={i === 0}>
          <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 text-left">
            <span className="flex items-baseline gap-5">
              <span className="em w-6 shrink-0 text-lg text-stone-dim">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[17px] font-light text-cream sm:text-lg">{item.q}</span>
            </span>
            <span
              aria-hidden
              className="accordion-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-cream/80 transition-transform duration-300"
            >
              +
            </span>
          </summary>
          <p className="max-w-prose pb-6 pl-11 text-[15px] leading-relaxed text-stone">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
