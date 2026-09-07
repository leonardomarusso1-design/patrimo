"use client";

import { useActionState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { requestAdvice, type AdviceState } from "@/app/app/investimentos/advice-actions";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

const empty: AdviceState = {};

export function AdviceCard({
  advice,
}: {
  advice: { summary: string; actions: string[]; created_at: string; model: string | null } | null;
}) {
  const [state, action, pending] = useActionState(async () => requestAdvice(), empty);

  return (
    <div className="mt-6 rounded-2xl border border-brand/30 bg-brand-50/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-brand-700">
          <Sparkles className="h-4 w-4" />
          <h3 className="font-display text-base font-bold">Análise da IA</h3>
        </div>
        <form action={action}>
          <Button size="sm" variant="secondary" loading={pending}>
            <RefreshCw className="h-3.5 w-3.5" />
            {advice ? "Gerar nova" : "Gerar análise"}
          </Button>
        </form>
      </div>

      {state.error && <p className="mt-3 text-sm text-danger">{state.error}</p>}

      {advice ? (
        <div className="mt-3">
          <p className="text-sm text-ink/90">{advice.summary}</p>
          <ul className="mt-3 space-y-1.5">
            {advice.actions.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink/85">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            {formatDate(advice.created_at)}
            {advice.model ? ` · ${advice.model}` : ""} · não é consultoria de
            investimento registrada.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">
          Gera uma leitura da sua carteira frente ao seu perfil, com ações objetivas
          de rebalanceamento. Sem previsão de curto prazo, sem indicação de ativo
          específico para comprar.
        </p>
      )}
    </div>
  );
}
