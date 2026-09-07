"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { PLANS, YEARLY_DISCOUNT_LABEL } from "@/lib/plans";
import { formatCurrency, cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Misc";

export function PricingTable() {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      <div className="mb-10 flex items-center justify-center gap-3">
        <span className={cn("text-sm font-medium", !yearly && "text-ink")}>Mensal</span>
        <button
          role="switch"
          aria-checked={yearly}
          onClick={() => setYearly((v) => !v)}
          className={cn(
            "relative h-7 w-12 rounded-full transition-colors",
            yearly ? "bg-accent" : "bg-ink/15",
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-5 w-5 rounded-full bg-[#ffffff] shadow transition-transform",
              yearly ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
        <span className={cn("text-sm font-medium", yearly && "text-ink")}>
          Anual <Badge tone="accent">{YEARLY_DISCOUNT_LABEL}</Badge>
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = yearly ? plan.yearly : plan.monthly;
          const suffix = yearly ? "/ano" : "/mês";
          return (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl border p-6",
                plan.highlight
                  ? "border-accent bg-card shadow-[var(--shadow-glow)]"
                  : "border-border bg-card shadow-[var(--shadow-card)]",
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-ink">{plan.name}</h3>
                {plan.highlight && <Badge tone="accent">Mais popular</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted">{plan.tagline}</p>

              <p className="mt-5 font-display text-3xl font-extrabold text-ink">
                {formatCurrency(price)}
                <span className="text-base font-semibold text-muted">{suffix}</span>
              </p>
              {yearly && (
                <p className="mt-1 text-xs text-muted">
                  equivale a {formatCurrency(plan.yearly / 12)}/mês
                </p>
              )}

              <ButtonLink
                href={`/cadastro?plano=${plan.id}&ciclo=${yearly ? "anual" : "mensal"}`}
                variant={plan.highlight ? "primary" : "secondary"}
                className="mt-6"
              >
                {plan.cta}
              </ButtonLink>

              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-ink/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        Pagamento em Pix, boleto ou cartão via Kiwify. Cancele quando quiser.
      </p>
    </div>
  );
}
