"use client";

import { useActionState, useState } from "react";
import { MessageCircle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { sendSupport, type SupportState } from "@/app/(site)/suporte/actions";

const empty: SupportState = {};

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(sendSupport, empty);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Falar com o suporte"
        className="fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand text-[#eaf5ee] shadow-[0_12px_34px_-8px_rgba(11,122,85,0.55)] hover:bg-brand-600"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-[min(92vw,360px)] rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="font-display text-base font-bold text-ink">Fale com a gente</p>
          <p className="mt-0.5 text-xs text-muted">
            Respondo por e-mail, normalmente no mesmo dia.
          </p>

          {state.ok ? (
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2.5 text-sm text-success">
              <Check className="h-4 w-4" /> Mensagem enviada. Vou responder no seu e-mail.
            </p>
          ) : (
            <form action={action} className="mt-3 space-y-3">
              {state.error && (
                <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
              )}
              <div>
                <Label htmlFor="s-name">Nome</Label>
                <Input id="s-name" name="name" required className="h-9" />
              </div>
              <div>
                <Label htmlFor="s-email">E-mail</Label>
                <Input id="s-email" name="email" type="email" required className="h-9" />
              </div>
              <div>
                <Label htmlFor="s-msg">Mensagem</Label>
                <textarea
                  id="s-msg"
                  name="message"
                  required
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand"
                />
              </div>
              <Button type="submit" loading={pending} className="w-full">
                Enviar
              </Button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
