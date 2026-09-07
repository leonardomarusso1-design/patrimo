import type { PlanId } from "@/types/database";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  highlight?: boolean;
  cta: string;
  features: string[];
  kiwifyMonthlyUrl?: string;
  kiwifyYearlyUrl?: string;
};

/**
 * Popcorn Pricing — 3 tiers (Good / Better / Best).
 * Preços definidos na sessão de brainstorming (mais caro que o MultiCap no topo).
 * Desconto anual ≈ 2 meses grátis.
 */
export const PLANS: Plan[] = [
  {
    id: "essential",
    name: "Essencial",
    tagline: "Organize o mês e pare de vazar dinheiro.",
    monthly: 49,
    yearly: 490,
    cta: "Começar no Essencial",
    features: [
      "Orçamento (receita, despesa fixa e variável)",
      "Reserva de emergência com meta guiada",
      "Metas financeiras com aportes",
      "Patrimônio básico (bens e dívidas)",
      "Blog aberto de educação financeira",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Faça o dinheiro que sobra trabalhar.",
    monthly: 97,
    yearly: 970,
    highlight: true,
    cta: "Assinar o Pro",
    features: [
      "Tudo do Essencial",
      "Carteira de investimentos com composição",
      "Multi-moeda de verdade (câmbio aplicado)",
      "Relatórios avançados (3, 6 e 12 meses)",
      "Todas as calculadoras",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "Piloto automático com IA lendo o mercado por você.",
    monthly: 197,
    yearly: 1970,
    cta: "Assinar o Elite",
    features: [
      "Tudo do Pro",
      "Open Finance (importação automática de transações)",
      "IA de investimentos: leitura diária do mercado + aportes sugeridos pelo seu perfil",
      "Escola completa desbloqueada (13 aulas)",
      "Relatório fiscal anual e suporte prioritário",
    ],
  },
];

export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  essential: 1,
  pro: 2,
  elite: 3,
};

export function planAllows(userPlan: PlanId, required: PlanId): boolean {
  return PLAN_RANK[userPlan] >= PLAN_RANK[required];
}

export function planName(id: PlanId): string {
  return id === "free" ? "Grátis" : PLANS.find((p) => p.id === id)?.name ?? id;
}

export const YEARLY_DISCOUNT_LABEL = "2 meses grátis";
