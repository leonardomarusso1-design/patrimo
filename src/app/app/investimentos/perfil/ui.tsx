"use client";

import { useActionState, useState } from "react";
import { INVESTOR_QUIZ } from "@/lib/investor";
import { saveInvestorProfile, type PerfilState } from "./actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const empty: PerfilState = {};

export function PerfilQuiz() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [state, action, pending] = useActionState(saveInvestorProfile, empty);
  const done = INVESTOR_QUIZ.every((q) => q.id in answers);

  return (
    <form action={action} className="space-y-6">
      {Object.entries(answers).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}

      {INVESTOR_QUIZ.map((q, i) => (
        <div
          key={q.id}
          className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
        >
          <p className="font-display text-sm font-bold text-ink">
            {i + 1}. {q.question}
          </p>
          <div className="mt-3 grid gap-2">
            {q.options.map((opt) => (
              <button
                type="button"
                key={opt.label}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.score }))}
                className={cn(
                  "rounded-xl border px-4 py-2.5 text-left text-sm transition-colors",
                  answers[q.id] === opt.score
                    ? "border-brand bg-brand-50 text-brand-700"
                    : "border-border text-muted hover:border-ink/25",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {state.error && (
        <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={!done} loading={pending} className="w-full">
        {done ? "Ver meu perfil" : `Responda todas (${Object.keys(answers).length}/${INVESTOR_QUIZ.length})`}
      </Button>
    </form>
  );
}
