import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { EntrarForm } from "./EntrarForm";

export const metadata: Metadata = { title: "Painel" };

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ volta?: string }> }) {
  const { volta = "/painel" } = await searchParams;
  return (
    <div className="bg-lines flex min-h-[100svh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-[380px] animate-fade-up">
        <div className="mb-10 flex flex-col items-center text-center">
          <Link href="/" aria-label="Voltar ao site">
            <Logo className="h-10" />
          </Link>
          <h1 className="display mt-10 text-4xl">
            Painel <span className="em">da igreja</span>
          </h1>
          <p className="mt-3 text-[14px] text-stone">Digite a senha para enviar e editar mensagens.</p>
        </div>
        <div className="glass-strong p-6 sm:p-8">
          <EntrarForm volta={volta} />
        </div>
        <Link href="/" className="mt-8 block text-center text-[12px] uppercase tracking-[0.18em] text-stone hover:text-cream">
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
}
