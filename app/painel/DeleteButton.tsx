"use client";

import { deleteMessage } from "./actions";

export function DeleteButton({ id, title, className }: { id: string; title: string; className?: string }) {
  return (
    <form
      action={deleteMessage}
      onSubmit={(e) => {
        if (!confirm(`Excluir definitivamente "${title || "sem título"}"? Esta ação não pode ser desfeita.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className ?? "btn-ghost !px-2 hover:!text-red-300"}>
        Excluir
      </button>
    </form>
  );
}
