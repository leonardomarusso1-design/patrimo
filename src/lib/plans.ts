import type { PlanId } from "@/types/database";

/**
 * Ordre tem um único plano pago: anual, R$ 97,90/ano, parcelável em até 12x.
 * O acesso ao painel é liberado só após a compra (hard paywall).
 */
export const PLAN = {
  id: "pro" as PlanId,
  name: "Ordre Anual",
  price: 97.9,
  installments: 12,
  get installmentValue() {
    return this.price / this.installments;
  },
  checkoutUrl: "https://pay.kiwify.com.br/m6Lxmo2",
  features: [
    "Orçamento completo (receita, despesa fixa e variável)",
    "Reserva de emergência com meta guiada",
    "Metas financeiras com aportes",
    "Carteira de investimentos e composição",
    "Patrimônio: bens, dívidas e patrimônio líquido",
    "Multi-moeda com câmbio aplicado",
    "Todas as calculadoras",
    "Academia Ordre — 13 aulas (liberadas conforme forem gravadas)",
    "Assistente com IA sobre os seus números",
    "Open Finance (em breve)",
  ],
};

export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  essential: 1,
  pro: 1,
  elite: 1,
};

/** Com plano único, "tem acesso" = qualquer plano pago. */
export function planAllows(userPlan: PlanId, _required: PlanId): boolean {
  void _required;
  return PLAN_RANK[userPlan] >= 1;
}

export function hasActiveAccess(profile: {
  plan: PlanId;
  plan_expires_at: string | null;
}): boolean {
  if (profile.plan === "free") return false;
  if (!profile.plan_expires_at) return true;
  return new Date(profile.plan_expires_at).getTime() > Date.now();
}

export function planName(id: PlanId): string {
  return id === "free" ? "Sem acesso" : PLAN.name;
}

type TrialProfile = {
  plan: PlanId;
  plan_expires_at: string | null;
  trial_started_at: string | null;
};

/** Está em teste grátis (não comprou ainda). Webhook limpa trial_started_at na compra. */
export function isTrial(p: TrialProfile): boolean {
  return !!p.trial_started_at && hasActiveAccess(p);
}

/** Dias restantes do acesso (arredonda pra cima, mínimo 0). */
export function daysLeft(p: { plan_expires_at: string | null }): number {
  if (!p.plan_expires_at) return 999;
  const ms = new Date(p.plan_expires_at).getTime() - new Date().getTime();
  return Math.max(Math.ceil(ms / 86400000), 0);
}
