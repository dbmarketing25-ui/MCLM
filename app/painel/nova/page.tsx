import { db } from "@/lib/supabase/server";
import { NewMessageForm } from "./NewMessageForm";

export default async function NovaPage() {
  const supabase = db();
  const { data } = await supabase.from("messages").select("preacher, series");
  const rows = (data ?? []) as { preacher: string; series: string | null }[];
  const preachers = [...new Set(rows.map((r) => r.preacher).filter(Boolean))].sort();
  const series = [...new Set(rows.map((r) => r.series ?? "").filter(Boolean))].sort();

  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow">Nova mensagem</p>
      <h1 className="display mt-3 text-4xl sm:text-5xl">
        Enviar <span className="em">transcrição</span>
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-stone">
        Cole o texto ou envie um arquivo .txt, .docx ou .pdf. A IA gera título, tópico, resumo, versículos, pontos e
        frases marcantes — tudo fica como rascunho para você revisar antes de publicar.
      </p>
      <NewMessageForm preachers={preachers} series={series} />
    </div>
  );
}
