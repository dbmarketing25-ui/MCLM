import { notFound } from "next/navigation";
import { db } from "@/lib/supabase/server";
import type { Message } from "@/lib/types";
import { MessageEditor } from "./MessageEditor";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = db();
  const { data } = await supabase.from("messages").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <MessageEditor message={data as Message} />;
}
