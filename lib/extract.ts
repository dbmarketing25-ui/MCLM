import "server-only";

/** Extrai o texto de um arquivo .txt, .docx ou .pdf. */
export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".txt") || file.type === "text/plain") {
    return clean(decodeText(buffer));
  }

  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer });
    return clean(value);
  }

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const { extractText: pdfText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await pdfText(pdf, { mergePages: true });
    return clean(Array.isArray(text) ? text.join("\n\n") : text);
  }

  throw new Error("Formato não suportado. Envie um arquivo .txt, .docx ou .pdf.");
}

function decodeText(buffer: Buffer) {
  const utf8 = buffer.toString("utf8");
  // Arquivos salvos no Bloco de Notas antigo podem vir em Windows-1252.
  if (utf8.includes("�")) return new TextDecoder("windows-1252").decode(buffer);
  return utf8.replace(/^﻿/, "");
}

function clean(text: string) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
