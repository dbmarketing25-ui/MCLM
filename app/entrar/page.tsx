import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { painelSenha } from "@/lib/painel-auth";
import { EntrarForm } from "./EntrarForm";

export const metadata: Metadata = { title: "Painel" };
export const dynamic = "force-dynamic";

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ volta?: string }> }) {
  const { volta = "/painel" } = await searchParams;
  const configurado = !!painelSenha();

  return (
    <div className="bg-lines flex min-h-[100svh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-[380px] animate-fade-up">
        <div className="mb-10 flex flex-col items-center text-center">
          <Link href="/" aria-label="Voltar ao site">
            <Logo className="h-10" />
          </Link>
          <h1 className="display mt-10 text-4xl">
            Área <span className="em">restrita</span>
          </h1>
          <p className="mt-3 text-[14px] text-stone">
            {configurado
              ? "Somente a administração da igreja pode enviar e editar mensagens."
              : "O painel está bloqueado até que uma senha seja configurada."}
          </p>
        </div>
        <div className="glass-strong p-6 sm:p-8">
          {configurado ? (
            <EntrarForm volta={volta} />
          ) : (
            <p className="text-[14px] leading-relaxed text-stone">
              Para liberar, cadastre a variável <code className="text-cream">PAINEL_SENHA</code> nas configurações do
              projeto na Vercel (Settings → Environment Variables) e publique novamente.
            </p>
          )}
        </div>
        <Link href="/" className="mt-8 block text-center text-[12px] uppercase tracking-[0.18em] text-stone hover:text-cream">
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
}
