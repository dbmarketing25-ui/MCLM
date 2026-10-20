import Link from "next/link";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/config";

export function Footer({ isOwner }: { isOwner: boolean }) {
  return (
    <footer className="relative border-t border-white/[0.06] bg-ink-950">
      <div className="container-x py-16 sm:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo className="h-8" />
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-stone">
              {site.tagline}. <span className="em text-cream/80">{site.slogan}</span>
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow mb-5">Endereço</p>
            <address className="not-italic text-[15px] leading-relaxed text-cream/85">
              {site.address.line1}
              <br />
              {site.address.line2}
            </address>
            <a
              href={site.address.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-[12px] uppercase tracking-[0.18em] text-stone underline-offset-4 hover:text-cream hover:underline"
            >
              Como chegar ↗
            </a>
          </div>

          <div className="md:col-span-4">
            <p className="eyebrow mb-5">Cultos</p>
            <ul className="space-y-3">
              {site.services.map((s) => (
                <li key={s.day} className="flex items-baseline justify-between gap-4 border-b border-white/[0.06] pb-3">
                  <span className="text-[15px] text-cream/85">
                    {s.day} <span className="text-stone">· {s.label}</span>
                  </span>
                  <span className="em text-lg text-cream">{s.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/[0.06] pt-8 text-[12px] text-stone-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.fullName}
          </p>
          <div className="flex gap-6">
            {site.social.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="hover:text-cream">
                {s.label}
              </a>
            ))}
            {isOwner && (
              <Link href="/painel" className="hover:text-cream">
                Painel
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
