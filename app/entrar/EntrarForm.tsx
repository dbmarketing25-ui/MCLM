"use client";

import { useActionState } from "react";
import { entrar } from "./actions";

export function EntrarForm({ volta }: { volta: string }) {
  const [state, action, pending] = useActionState(entrar, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="volta" value={volta} />
      <div>
        <label htmlFor="senha" className="label">
          Senha
        </label>
        <input id="senha" name="senha" type="password" autoComplete="current-password" required autoFocus className="field" />
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-[13px] text-red-200">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-light w-full !py-3.5">
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
