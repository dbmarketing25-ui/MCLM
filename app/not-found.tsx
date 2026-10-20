import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="bg-lines flex min-h-[100svh] flex-col items-center justify-center px-5 text-center">
      <Logo className="h-10" />
      <h1 className="display mt-12 text-5xl sm:text-6xl">
        Página <span className="em">não encontrada</span>
      </h1>
      <p className="mt-4 text-stone">O conteúdo pode ter sido removido ou ainda não foi publicado.</p>
      <Link href="/" className="btn-light mt-10">
        Voltar ao início
      </Link>
    </div>
  );
}
