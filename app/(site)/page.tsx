import Link from "next/link";
import { Faq } from "@/components/Faq";
import { Gallery, GalleryItem } from "@/components/Gallery";
import { Logo } from "@/components/Logo";
import { MessageCard } from "@/components/MessageCard";
import { Photo } from "@/components/Photo";
import { Reels } from "@/components/Reels";
import { Reveal } from "@/components/Reveal";
import { SectionTitle } from "@/components/SectionTitle";
import { site } from "@/lib/config";
import { isOwner } from "@/lib/owner";
import { getLatest, getMostRecent, getStats } from "@/lib/messages";
import { CATEGORY_LABEL, type MessageCard as Card } from "@/lib/types";
import { formatDate, paragraphs } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [stats, recent, pregacoes, estudos, owner] = await Promise.all([
    getStats(),
    getMostRecent(),
    getLatest("pregacao"),
    getLatest("estudo"),
    isOwner(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative">
        <Photo src={site.images.hero} shade="full" zoom={false} className="min-h-[100svh] w-full">
          <div className="container-x relative z-10 flex min-h-[100svh] flex-col items-center justify-center pb-40 pt-28 text-center sm:pb-48">
            <Logo className="h-12 animate-fade-up sm:h-16" />
            <p className="eyebrow mt-10 animate-fade-up [animation-delay:120ms]">{site.tagline}</p>
            <h1 className="display mt-6 max-w-4xl animate-fade-up text-balance text-[46px] leading-[1.02] [animation-delay:220ms] sm:text-7xl lg:text-[96px]">
              {site.heroTitle.lead} <span className="em">{site.heroTitle.emphasis}</span>
            </h1>
            <p className="mt-7 max-w-xl animate-fade-up text-pretty text-[16px] leading-relaxed text-cream/75 [animation-delay:320ms] sm:text-lg">
              {site.heroText}
            </p>
            <div className="mt-10 flex animate-fade-up flex-wrap justify-center gap-3 [animation-delay:420ms]">
              <Link href="/pregacoes" className="btn-light">
                Pregações
              </Link>
              <Link href="/estudos" className="btn-outline">
                Estudos
              </Link>
            </div>
          </div>
        </Photo>

        {/* Faixa de números */}
        <div className="container-x relative z-20 -mt-28 sm:-mt-32">
          <Reveal className="glass-strong grid grid-cols-2 divide-white/[0.08] md:grid-cols-4 md:divide-x">
            <Stat value={stats.pregacoes} label="Pregações" />
            <Stat value={stats.estudos} label="Estudos" />
            <Stat value={stats.livros} label="Livros da Bíblia" emphasis="estudados" />
            <Stat value={stats.series} label="Séries" />
          </Reveal>
        </div>
      </section>

      {/* MENSAGEM MAIS RECENTE */}
      <section className="py-24 sm:py-36">
        <div className="container-x">
          <Reveal>
            <SectionTitle eyebrow="Em destaque" lead="O que Deus falou" emphasis="nesta semana" center className="max-w-3xl" />
          </Reveal>

          {recent ? (
            <Reveal delay={100} className="mt-14 sm:mt-20">
              <Link href={`/mensagem/${recent.slug}`} className="group grid items-stretch gap-6 md:grid-cols-2 md:gap-10">
                <Photo src={site.images.featured} className="glass min-h-[300px] w-full md:min-h-[480px]" />
                <div className="flex flex-col justify-center py-2 md:py-10">
                  <p className="eyebrow">
                    {CATEGORY_LABEL[recent.category].singular} · {formatDate(recent.date)}
                  </p>
                  <h3 className="display mt-5 text-balance text-4xl leading-[1.08] sm:text-5xl">{recent.title}</h3>
                  {recent.main_topic && (
                    <p className="em mt-6 text-2xl leading-snug text-amber-warm/90">{recent.main_topic}</p>
                  )}
                  <p className="mt-6 line-clamp-4 text-[15px] leading-relaxed text-stone">
                    {paragraphs(recent.summary)[0]}
                  </p>
                  <div className="mt-8 flex items-center gap-6">
                    <span className="btn-light">Ler mensagem</span>
                    <span className="text-[13px] text-cream/70">{recent.preacher}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ) : (
            <EmptyState owner={owner} />
          )}
        </div>
      </section>

      {/* VÍDEOS DO INSTAGRAM */}
      <section className="border-t border-white/[0.05] bg-ink-850 py-24 sm:py-32">
        <div className="container-x">
          <Reveal className="mb-12 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle eyebrow="Instagram · @eumissao" lead="Momentos da" emphasis="nossa igreja" />
            <a
              href={site.social[0].url}
              target="_blank"
              rel="noreferrer"
              className="btn-outline self-start sm:self-auto"
            >
              Seguir no Instagram
            </a>
          </Reveal>
          <Reveal delay={80}>
            <Reels reels={site.reels} />
          </Reveal>
        </div>
      </section>

      <Latest
        title="Últimas"
        emphasis="pregações"
        eyebrow="Cultos de domingo"
        href="/pregacoes"
        items={pregacoes}
      />
      <Latest
        title="Últimos"
        emphasis="estudos"
        eyebrow="Estudo bíblico · 1º domingo do mês"
        href="/estudos"
        items={estudos}
        className="bg-ink-850"
      />

      {/* FAQ */}
      <section className="border-t border-white/[0.05] py-24 sm:py-36">
        <div className="container-x grid gap-14 md:grid-cols-2 md:gap-20">
          <Reveal>
            <SectionTitle eyebrow="Perguntas frequentes" lead="Tudo o que você" emphasis="precisa saber" />
            <Photo src={site.images.faq} className="glass mt-10 hidden aspect-[4/5] w-full md:block" />
          </Reveal>
          <Reveal delay={120} className="md:pt-16">
            <Faq />
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label, emphasis }: { value: number; label: string; emphasis?: string }) {
  return (
    <div className="flex flex-col items-center justify-center border-white/[0.08] px-4 py-8 text-center max-md:odd:border-r max-md:[&:nth-child(-n+2)]:border-b sm:py-10">
      <span className="display text-5xl text-cream sm:text-6xl">{value}</span>
      <span className="mt-3 text-[11px] uppercase tracking-[0.22em] text-stone">
        {label} {emphasis && <span className="em text-[13px] normal-case tracking-normal">{emphasis}</span>}
      </span>
    </div>
  );
}

function Latest({
  title,
  emphasis,
  eyebrow,
  href,
  items,
  className,
}: {
  title: string;
  emphasis: string;
  eyebrow: string;
  href: string;
  items: Card[];
  className?: string;
}) {
  return (
    <section className={`border-t border-white/[0.05] py-24 sm:py-32 ${className ?? ""}`}>
      <div className="container-x">
        <Reveal className="mb-12 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle eyebrow={eyebrow} lead={title} emphasis={emphasis} />
          <Link href={href} className="btn-outline self-start sm:self-auto">
            Ver todos
          </Link>
        </Reveal>
        {items.length ? (
          <Reveal delay={80}>
            <Gallery>
              {items.map((m) => (
                <GalleryItem key={m.id}>
                  <MessageCard m={m} className="h-full" />
                </GalleryItem>
              ))}
            </Gallery>
          </Reveal>
        ) : (
          <p className="glass p-10 text-center text-stone">Nenhuma mensagem publicada ainda.</p>
        )}
      </div>
    </section>
  );
}

function EmptyState({ owner }: { owner: boolean }) {
  return (
    <div className="glass mx-auto mt-14 max-w-xl p-10 text-center">
      <p className="text-stone">Em breve, as primeiras mensagens estarão aqui.</p>
      {owner && (
        <Link href="/painel/nova" className="btn-light mt-6">
          Enviar a primeira
        </Link>
      )}
    </div>
  );
}
