import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Photo } from "@/components/Photo";
import { QuotesCarousel } from "@/components/QuotesCarousel";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/config";
import { isOwner } from "@/lib/owner";
import { getBySlug, getNeighbors } from "@/lib/messages";
import { CATEGORY_LABEL } from "@/lib/types";
import { formatDate, paragraphs, wordCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await getBySlug((await params).slug);
  return { title: m?.title ?? "Mensagem" };
}

export default async function MessagePage({ params }: Props) {
  const { slug } = await params;
  const m = await getBySlug(slug);
  if (!m) notFound();

  const [{ older, newer }, owner] = await Promise.all([getNeighbors(m), isOwner()]);
  const cat = CATEGORY_LABEL[m.category];
  const minutes = Math.max(1, Math.round(wordCount(m.transcript) / 230));
  const image = m.category === "pregacao" ? site.images.pregacoes : site.images.estudos;

  return (
    <article>
      {/* Cabeçalho */}
      <Photo src={image} shade="full" zoom={false} className="w-full">
        <header className="container-x relative z-10 flex min-h-[78svh] flex-col justify-end pb-16 pt-32 sm:pb-24">
          <nav className="eyebrow mb-8 flex flex-wrap items-center gap-3 animate-fade-up">
            <Link href={cat.path} className="hover:text-cream">
              {cat.plural}
            </Link>
            {m.series && (
              <>
                <span className="text-stone-dim">/</span>
                <Link href={`${cat.path}?serie=${encodeURIComponent(m.series)}`} className="!text-amber-warm/90 hover:!text-cream">
                  {m.series}
                </Link>
              </>
            )}
          </nav>
          <h1 className="display max-w-5xl animate-fade-up text-balance text-[44px] leading-[1.02] [animation-delay:100ms] sm:text-7xl lg:text-[88px]">
            {m.title}
          </h1>
          <div className="mt-10 flex animate-fade-up flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-cream/75 [animation-delay:200ms]">
            <Meta label="Pregador" value={m.preacher} />
            <Meta label="Data" value={formatDate(m.date)} />
            {m.transcript && <Meta label="Leitura" value={`${minutes} min de transcrição`} />}
            {owner && (
              <Link href={`/painel/${m.id}`} className="btn-outline !py-2 sm:ml-auto">
                Editar
              </Link>
            )}
          </div>
        </header>
      </Photo>

      {/* Tópico principal */}
      {m.main_topic && (
        <section className="border-b border-white/[0.06] py-20 sm:py-28">
          <Reveal className="container-x text-center">
            <p className="eyebrow">Tópico principal</p>
            <p className="em mx-auto mt-8 max-w-4xl text-balance text-[32px] leading-[1.2] text-cream sm:text-5xl lg:text-[56px]">
              {m.main_topic}
            </p>
          </Reveal>
        </section>
      )}

      {/* Resumo */}
      <section className="py-20 sm:py-28">
        <div className="container-x grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <p className="eyebrow">Resumo</p>
            <h2 className="display mt-5 text-4xl leading-tight sm:text-5xl">
              A mensagem <span className="em">em síntese</span>
            </h2>
          </Reveal>
          <Reveal delay={100} className="space-y-6 md:col-span-8 md:col-start-6">
            {paragraphs(m.summary).map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-pretty text-[19px] font-light leading-[1.7] text-cream sm:text-[21px]"
                    : "text-pretty text-[16px] leading-[1.8] text-cream/75 sm:text-[17px]"
                }
              >
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Versículos */}
      {m.verses.length > 0 && (
        <section className="border-t border-white/[0.05] bg-ink-850 py-20 sm:py-28">
          <div className="container-x">
            <Reveal className="mb-14 text-center">
              <p className="eyebrow">Passagens bíblicas</p>
              <h2 className="display mt-5 text-4xl sm:text-5xl">
                O que diz <span className="em">a Escritura</span>
              </h2>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-2 md:gap-6">
              {m.verses.map((v, i) => (
                <Reveal key={`${v.reference}-${i}`} delay={(i % 2) * 80}>
                  <figure className="glass flex h-full flex-col p-7 sm:p-9">
                    <span aria-hidden className="em -mb-2 text-5xl leading-none text-amber-warm/50">
                      “
                    </span>
                    <blockquote className="em flex-1 text-pretty text-[22px] leading-[1.45] text-cream sm:text-2xl">
                      {v.text || "—"}
                    </blockquote>
                    <figcaption className="mt-7 flex items-center gap-4">
                      <span className="h-px w-8 bg-white/25" />
                      <span className="text-[12px] font-medium uppercase tracking-[0.2em] text-cream/80">
                        {v.reference}
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pontos principais */}
      {m.key_points.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="container-x grid gap-12 md:grid-cols-12">
            <Reveal className="md:col-span-4">
              <div className="md:sticky md:top-28">
                <p className="eyebrow">Pontos principais</p>
                <h2 className="display mt-5 text-4xl leading-tight sm:text-5xl">
                  Lições para <span className="em">a vida</span>
                </h2>
              </div>
            </Reveal>
            <ol className="md:col-span-8 md:col-start-6">
              {m.key_points.map((k, i) => (
                <Reveal as="li" key={i} delay={60} className="grid grid-cols-[56px_1fr] gap-4 border-t border-white/[0.08] py-8 sm:grid-cols-[88px_1fr] sm:py-10">
                  <span className="em text-4xl leading-none text-amber-warm/80 sm:text-5xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[21px] font-light leading-snug text-cream sm:text-2xl">{k.title}</h3>
                    {k.description && (
                      <p className="mt-3 text-pretty text-[15px] leading-relaxed text-stone sm:text-base">{k.description}</p>
                    )}
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Frases marcantes */}
      {m.quotes.length > 0 && (
        <section className="border-y border-white/[0.05] bg-ink-850 py-20 sm:py-32">
          <div className="container-x">
            <Reveal>
              <p className="eyebrow mb-10 text-center">Frases marcantes</p>
              <QuotesCarousel quotes={m.quotes} author={m.preacher} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Transcrição */}
      {m.transcript && (
        <section className="py-20 sm:py-28">
          <div className="container-x">
            <details className="glass group mx-auto max-w-4xl">
              <summary className="flex cursor-pointer items-center justify-between gap-6 p-6 sm:p-8">
                <span>
                  <span className="eyebrow block">Transcrição</span>
                  <span className="mt-2 block text-xl font-light text-cream sm:text-2xl">
                    Ler transcrição <span className="em">completa</span>
                  </span>
                </span>
                <span
                  aria-hidden
                  className="accordion-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-lg text-cream/80 transition-transform duration-300"
                >
                  +
                </span>
              </summary>
              <div className="border-t border-white/[0.08] px-6 pb-10 pt-8 sm:px-12">
                <div className="mx-auto max-w-prose space-y-5 text-[16px] leading-[1.85] text-cream/75">
                  {paragraphs(m.transcript.replace(/\n(?!\n)/g, "\n\n")).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </section>
      )}

      {/* Navegação */}
      {(older || newer) && (
        <nav className="border-t border-white/[0.06]">
          <div className="container-x grid md:grid-cols-2">
            {older ? (
              <NeighborLink href={`/mensagem/${older.slug}`} dir="Anterior" title={older.title} />
            ) : (
              <span />
            )}
            {newer && <NeighborLink href={`/mensagem/${newer.slug}`} dir="Próxima" title={newer.title} right />}
          </div>
        </nav>
      )}
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <span>
      <span className="mr-2 text-[10px] uppercase tracking-[0.22em] text-stone">{label}</span>
      {value}
    </span>
  );
}

function NeighborLink({ href, dir, title, right }: { href: string; dir: string; title: string; right?: boolean }) {
  return (
    <Link
      href={href}
      className={`group py-10 transition-colors hover:bg-white/[0.02] sm:py-14 ${right ? "text-right md:border-l md:border-white/[0.06] md:pl-10" : "md:pr-10"}`}
    >
      <span className="eyebrow">{right ? `${dir} →` : `← ${dir}`}</span>
      <span className="mt-3 block text-balance text-xl font-light text-cream/85 transition-colors group-hover:text-cream sm:text-2xl">
        {title}
      </span>
    </Link>
  );
}
