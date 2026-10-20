import type { Metadata } from "next";
import { ListingPage, readFilters } from "@/components/ListingPage";
import { site } from "@/lib/config";

export const metadata: Metadata = { title: "Estudos" };
export const dynamic = "force-dynamic";

export default async function EstudosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ListingPage
      category="estudo"
      eyebrow="Estudo bíblico · todo 1º domingo do mês, às 9h"
      lead="Aprofundar-se na"
      emphasis="Palavra"
      description="Estudos versículo a versículo, organizados em séries, para quem deseja ir mais fundo nas Escrituras."
      image={site.images.estudos}
      filters={readFilters(await searchParams)}
    />
  );
}
