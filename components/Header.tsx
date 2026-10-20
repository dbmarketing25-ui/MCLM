"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/pregacoes", label: "Pregações" },
  { href: "/estudos", label: "Estudos" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled || open ? "border-b border-white/[0.06] bg-ink-900/70 backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <div className="container-x flex h-16 items-center justify-between sm:h-20">
          <Link href="/" className="flex items-center gap-3" aria-label="Página inicial">
            <Logo className="h-6 sm:h-7" />
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "text-[12px] uppercase tracking-[0.2em] transition-colors",
                  isActive(n.href) ? "text-cream" : "text-stone hover:text-cream",
                )}
              >
                {n.label}
              </Link>
            ))}
            <Link href="/painel" className="btn-outline !px-4 !py-2">
              Painel
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative -mr-2 flex h-10 w-10 items-center justify-center md:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            <span
              className={cn(
                "absolute h-px w-6 bg-cream transition-transform duration-300",
                open ? "rotate-45" : "-translate-y-[4px]",
              )}
            />
            <span
              className={cn(
                "absolute h-px w-6 bg-cream transition-transform duration-300",
                open ? "-rotate-45" : "translate-y-[4px]",
              )}
            />
          </button>
        </div>
      </header>

      {/* Menu do celular */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-ink-900/95 backdrop-blur-2xl transition-opacity duration-500 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <nav className="container-x mt-28 flex flex-col">
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "border-b border-white/[0.07] py-5 text-3xl font-light tracking-tight transition-all duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                isActive(n.href) ? "text-cream" : "text-stone",
              )}
              style={{ transitionDelay: open ? `${80 + i * 60}ms` : "0ms" }}
            >
              {n.label}
            </Link>
          ))}
          <Link href="/painel" className="btn-light mt-10 self-start">
            Abrir painel
          </Link>
        </nav>
      </div>
    </>
  );
}
