import { NextResponse } from "next/server";
import { extractText } from "@/lib/extract";

export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Arquivo maior que 15 MB." }, { status: 400 });

  try {
    const text = await extractText(file);
    if (!text) return NextResponse.json({ error: "Não foi encontrado texto no arquivo." }, { status: 422 });
    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha ao ler o arquivo.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
