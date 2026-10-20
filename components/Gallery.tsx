"use client";

import { useRef } from "react";

/** Galeria horizontal com rolagem por arrasto/toque e setas no desktop. */
export function Gallery({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-4 sm:-mx-8 sm:gap-6 sm:px-8 lg:-mx-12 lg:px-12"
      >
        {children}
      </div>
      <div className="mt-6 hidden justify-end gap-2 sm:flex">
        <button type="button" onClick={() => scroll(-1)} className="btn-outline !h-10 !w-10 !p-0" aria-label="Anterior">
          ←
        </button>
        <button type="button" onClick={() => scroll(1)} className="btn-outline !h-10 !w-10 !p-0" aria-label="Próximo">
          →
        </button>
      </div>
    </div>
  );
}

export function GalleryItem({ children }: { children: React.ReactNode }) {
  return <div className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">{children}</div>;
}
