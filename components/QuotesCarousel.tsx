"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Carrossel de frases marcantes: toque/arraste no celular, setas e avanço automático. */
export function QuotesCarousel({ quotes, author }: { quotes: string[]; author?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const n = el.children.length;
    const next = (i + n) % n;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (paused || quotes.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => goTo(index + 1), 7000);
    return () => clearInterval(t);
  }, [index, paused, quotes.length, goTo]);

  if (!quotes.length) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div ref={track} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto" aria-live="polite">
        {quotes.map((q, i) => (
          <figure key={i} className="w-full shrink-0 snap-center px-1 text-center">
            <span aria-hidden className="em block text-7xl leading-none text-amber-warm/60 sm:text-8xl">
              “
            </span>
            <blockquote className="em mx-auto -mt-4 max-w-3xl text-balance text-[28px] leading-[1.25] text-cream sm:text-4xl lg:text-[44px]">
              {q}
            </blockquote>
            {author && (
              <figcaption className="eyebrow mt-8">— {author}</figcaption>
            )}
          </figure>
        ))}
      </div>

      {quotes.length > 1 && (
        <div className="mt-10 flex items-center justify-center gap-6">
          <button type="button" onClick={() => goTo(index - 1)} className="btn-outline !h-10 !w-10 !p-0" aria-label="Frase anterior">
            ←
          </button>
          <div className="flex gap-2">
            {quotes.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Frase ${i + 1}`}
                className={cn(
                  "h-[3px] rounded-full transition-all duration-500",
                  i === index ? "w-8 bg-cream" : "w-3 bg-white/20 hover:bg-white/40",
                )}
              />
            ))}
          </div>
          <button type="button" onClick={() => goTo(index + 1)} className="btn-outline !h-10 !w-10 !p-0" aria-label="Próxima frase">
            →
          </button>
        </div>
      )}
    </div>
  );
}
