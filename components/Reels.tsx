"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Reel = { src: string; poster?: string; url: string; title: string; text: string };

/** Se o vídeo não carregar, avança depois deste tempo (ms). */
const FALLBACK_MS = 8000;

/**
 * Vitrine de vídeos verticais: toca um de cada vez, automaticamente.
 * O vídeo ativo fica maior; quando termina, o próximo cresce e começa.
 */
export function Reels({ reels }: { reels: readonly Reel[] }) {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  const next = useCallback(() => setActive((i) => (i + 1) % reels.length), [reels.length]);

  // Vídeos que já falharam antes do carregamento do script (ex.: arquivo ausente)
  useEffect(() => {
    const broken: Record<number, boolean> = {};
    videos.current.forEach((v, i) => {
      if (v?.error) broken[i] = true;
    });
    if (Object.keys(broken).length) setFailed((f) => ({ ...f, ...broken }));
  }, []);

  // Só toca quando a seção está visível na tela
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Toca o ativo, pausa e volta ao início os demais
  useEffect(() => {
    setProgress(0);
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === active && inView) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [active, inView]);

  useEffect(() => {
    videos.current.forEach((v) => v && (v.muted = muted));
  }, [muted]);

  // Vídeo indisponível: avança por tempo, com barra de progresso simulada
  useEffect(() => {
    if (!inView || !failed[active]) return;
    const start = Date.now();
    const t = setInterval(() => {
      const p = (Date.now() - start) / FALLBACK_MS;
      setProgress(Math.min(1, p));
      if (p >= 1) next();
    }, 100);
    return () => clearInterval(t);
  }, [active, inView, failed, next]);

  // No celular, mantém o card ativo centralizado (sem rolar a página)
  useEffect(() => {
    const el = track.current;
    const card = el?.children[active] as HTMLElement | undefined;
    if (!el || !card || el.scrollWidth <= el.clientWidth) return;
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <div ref={section} className="relative">
      <div
        ref={track}
        className="no-scrollbar -mx-5 flex h-[520px] gap-3 overflow-x-auto px-5 sm:mx-0 sm:h-[600px] sm:overflow-visible sm:px-0 lg:h-[640px]"
      >
        {reels.map((r, i) => {
          const isActive = i === active;
          return (
            <article
              key={r.url}
              onClick={() => !isActive && setActive(i)}
              className={cn(
                "group relative shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition-[flex-grow,width,opacity,filter] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] sm:shrink sm:basis-0",
                isActive
                  ? "w-[74vw] sm:w-auto sm:grow-[2.6]"
                  : "w-[38vw] cursor-pointer sm:w-auto sm:grow opacity-70 hover:opacity-100",
              )}
              style={{
                backgroundImage:
                  "radial-gradient(120% 90% at 70% 10%, rgba(201,150,95,.35), transparent 55%), linear-gradient(160deg,#2a211a,#121212)",
              }}
            >
              {!failed[i] && (
                <video
                  ref={(el) => {
                    videos.current[i] = el;
                  }}
                  src={r.src}
                  poster={r.poster}
                  muted
                  playsInline
                  preload={isActive ? "auto" : "metadata"}
                  onEnded={() => isActive && next()}
                  onTimeUpdate={(e) => {
                    if (!isActive) return;
                    const v = e.currentTarget;
                    if (v.duration) setProgress(v.currentTime / v.duration);
                  }}
                  onError={() => setFailed((f) => ({ ...f, [i]: true }))}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms]",
                    !isActive && "scale-105 group-hover:scale-100",
                  )}
                />
              )}

              {/* degradê para legibilidade */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/85" />

              {/* barra de progresso */}
              <div className="absolute inset-x-4 top-4 h-[2px] overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full bg-cream transition-[width] duration-200 ease-linear"
                  style={{ width: isActive ? `${progress * 100}%` : "0%" }}
                />
              </div>

              {/* número */}
              <span className="em absolute left-4 top-8 text-2xl text-cream/80">{String(i + 1).padStart(2, "0")}</span>

              {isActive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMuted((m) => !m);
                  }}
                  className="absolute right-4 top-8 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-[13px] text-cream backdrop-blur-md transition hover:bg-black/50"
                  aria-label={muted ? "Ativar som" : "Desativar som"}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                    <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
                    {muted ? (
                      <path d="m17 9 5 6m0-6-5 6" strokeLinecap="round" />
                    ) : (
                      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
                    )}
                  </svg>
                </button>
              )}

              {/* legenda */}
              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 p-5 transition-all duration-700 sm:p-6",
                  isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
              >
                <h3 className="text-xl font-light leading-snug text-cream sm:text-2xl">{r.title}</h3>
                <p className="mt-2 line-clamp-3 max-w-sm text-[13px] leading-relaxed text-cream/75">{r.text}</p>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-4 inline-block text-[11px] uppercase tracking-[0.18em] text-cream/90 underline-offset-4 hover:underline"
                >
                  Ver no Instagram ↗
                </a>
              </div>

              {/* título vertical nos cards recolhidos */}
              {!isActive && (
                <p className="absolute bottom-5 left-4 right-4 line-clamp-2 text-[13px] font-light text-cream/85">
                  {r.title}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
