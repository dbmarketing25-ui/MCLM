import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Painel" };
export const dynamic = "force-dynamic";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-900">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-900/80 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Link href="/" aria-label="Ver site">
              <Logo className="h-6" />
            </Link>
            <span className="hidden h-5 w-px bg-white/15 sm:block" />
            <Link href="/painel" className="hidden text-[12px] uppercase tracking-[0.2em] text-stone hover:text-cream sm:block">
              Painel
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn-ghost">
              Ver site
            </Link>
            <Link href="/painel/nova" className="btn-light !px-4 !py-2">
              + Nova
            </Link>
          </div>
        </div>
      </header>
      <main className="container-x py-10 sm:py-14">{children}</main>
    </div>
  );
}
