import { Check } from "lucide-react";
import { PLAN } from "@/lib/plans";
import { formatCurrency } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Misc";

export function PricingTable() {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-brand bg-card p-7 shadow-[var(--shadow-glow)]">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink">{PLAN.name}</h3>
          <Badge tone="accent">Plano único</Badge>
        </div>
        <p className="mt-1 text-sm text-muted">
          Um preço, tudo incluído. Sem mensalidade recorrente.
        </p>

        <p className="mt-6 font-display text-4xl font-extrabold text-ink">
          {formatCurrency(PLAN.price)}
          <span className="text-base font-semibold text-muted">/ano</span>
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2">
          <span className="font-display text-sm font-bold text-brand-700">
            ou {PLAN.installments}x de {formatCurrency(PLAN.installmentValue)}
          </span>
          <span className="text-xs text-brand-700/80">no cartão</span>
        </div>

        <ButtonLink href="/cadastro" className="mt-6 w-full">
          Testar 7 dias grátis
        </ButtonLink>
        <a
          href={PLAN.checkoutUrl}
          className="mt-2 block text-center text-xs font-medium text-accent-dim hover:underline"
        >
          ou assinar agora →
        </a>
        <p className="mt-2 text-center text-xs text-muted">
          Grátis por 7 dias, sem cartão. Depois, cobrança via Kiwify (Pix, boleto ou 12x).
        </p>

        <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
          {PLAN.features.map((f) => (
            <li key={f} className="flex gap-2.5 text-sm text-ink/90">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
