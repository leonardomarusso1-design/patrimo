"use client";

import { useActionState } from "react";
import { replySupport, type ReplyState } from "./actions";

const empty: ReplyState = {};

export function ReplyBox({ id, email }: { id: string; email: string }) {
  const [state, action, pending] = useActionState(replySupport, empty);

  if (state.ok) {
    return (
      <p className="mt-3 rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
        Resposta gravada.{" "}
        {state.emailSent
          ? "E-mail enviado."
          : `E-mail não configurado — copie o texto e responda de ${email}.`}
      </p>
    );
  }

  return (
    <form action={action} className="mt-3 space-y-2">
      <input type="hidden" name="id" value={id} />
      {state.error && (
        <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      <textarea
        name="text"
        required
        rows={3}
        placeholder="Escreva a resposta…"
        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-[#eaf5ee] hover:bg-brand-600"
        >
          {pending ? "Enviando…" : "Responder"}
        </button>
        <a
          href={`mailto:${email}?subject=${encodeURIComponent("Resposta do suporte — Ordre")}`}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink"
        >
          Abrir no e-mail
        </a>
      </div>
    </form>
  );
}
