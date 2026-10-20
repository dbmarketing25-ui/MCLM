import type { Metadata } from "next";
import { ListingPage, readFilters } from "@/components/ListingPage";
import { site } from "@/lib/config";

export const metadata: Metadata = { title: "Pregações" };
export const dynamic = "force-dynamic";

export default async function PregacoesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ListingPage
      category="pregacao"
      eyebrow="Cultos de domingo"
      lead="Mensagens que"
      emphasis="permanecem"
      description="As pregações dos nossos cultos, com resumo, versículos, pontos principais e a transcrição completa."
      image={site.images.pregacoes}
      filters={readFilters(await searchParams)}
    />
  );
}
