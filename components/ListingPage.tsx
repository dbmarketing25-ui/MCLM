import { Suspense } from "react";
import { FilterBar } from "@/components/FilterBar";
import { MessageCard } from "@/components/MessageCard";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { getFilterOptions, listMessages, type ListFilters } from "@/lib/messages";
import type { Category } from "@/lib/types";

export async function ListingPage({
  category,
  eyebrow,
  lead,
  emphasis,
  description,
  image,
  filters,
}: {
  category: Category;
  eyebrow: string;
  lead: string;
  emphasis: string;
  description: string;
  image: string;
  filters: ListFilters;
}) {
  const [items, options] = await Promise.all([listMessages(category, filters), getFilterOptions(category)]);

  return (
    <>
      <section className="relative">
        <Photo src={image} shade="full" zoom={false} className="w-full">
          <div className="container-x relative z-10 flex min-h-[62svh] flex-col items-center justify-end pb-20 pt-32 text-center sm:min-h-[70svh] sm:pb-28">
            <p className="eyebrow animate-fade-up">{eyebrow}</p>
            <h1 className="display mt-6 animate-fade-up text-balance text-[46px] leading-[1.02] [animation-delay:120ms] sm:text-7xl lg:text-8xl">
              {lead} <span className="em">{emphasis}</span>
            </h1>
            <p className="mt-6 max-w-xl animate-fade-up text-pretty text-[16px] leading-relaxed text-cream/70 [animation-delay:220ms]">
              {description}
            </p>
          </div>
        </Photo>
      </section>

      <section className="pb-28 sm:pb-36">
        <div className="container-x">
          <div className="relative z-30 -mt-8 md:sticky md:top-24">
            <Suspense>
              <FilterBar options={options} total={items.length} />
            </Suspense>
          </div>

          {items.length ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {items.map((m, i) => (
                <Reveal key={m.id} delay={(i % 3) * 80}>
                  <MessageCard m={m} className="h-full" />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="glass mt-12 p-12 text-center">
              <p className="em text-2xl text-cream">Nada encontrado</p>
              <p className="mt-3 text-[15px] text-stone">Tente outra palavra ou limpe os filtros.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function readFilters(sp: Record<string, string | string[] | undefined>): ListFilters {
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  return { pregador: get("pregador"), serie: get("serie"), livro: get("livro"), q: get("q") };
}
