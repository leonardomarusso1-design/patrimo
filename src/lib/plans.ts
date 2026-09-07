import type { PlanId } from "@/types/database";

/**
 * Patrimo tem um único plano pago: anual, R$ 97,90/ano, parcelável em até 12x.
 * O acesso ao painel é liberado só após a compra (hard paywall).
 */
export const PLAN = {
  id: "pro" as PlanId,
  name: "Patrimo Anual",
  price: 97.9,
  installments: 12,
  get installmentValue() {
    return this.price / this.installments;
  },
  checkoutUrl: "https://kiwify.app/LuK5uon",
  features: [
    "Orçamento completo (receita, despesa fixa e variável)",
    "Reserva de emergência com meta guiada",
    "Metas financeiras com aportes",
    "Carteira de investimentos e composição",
    "Patrimônio: bens, dívidas e patrimônio líquido",
    "Multi-moeda com câmbio aplicado",
    "Todas as calculadoras",
    "Escola — 13 aulas (liberadas conforme forem gravadas)",
    "IA de investimentos e Open Finance (em breve)",
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
