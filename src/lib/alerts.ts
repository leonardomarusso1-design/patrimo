export type Alert = {
  level: "danger" | "warn" | "info";
  text: string;
  href: string;
};

export type AlertInput = {
  currency: string;
  monthIncome: number;
  monthExpense: number;
  variable: number;
  reserveSaved: number;
  reserveTarget: number;
  goals: { name: string; target: number; saved: number; deadline: string | null }[];
};

function brl(n: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
    maximumFractionDigits: 0,
  }).format(n);
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - new Date().getTime()) / 86400000);
}

/**
 * Alertas acionáveis pro dashboard. Ordem = prioridade (danger primeiro).
 * Puro: recebe números já calculados, devolve a lista.
 */
export function buildAlerts(i: AlertInput): Alert[] {
  const out: Alert[] = [];
  const balance = i.monthIncome - i.monthExpense;

  if (balance < 0) {
    out.push({
      level: "danger",
      text: `Mês no vermelho: ${brl(balance, i.currency)}. Corte no variável.`,
      href: "/app/orcamento",
    });
  } else if (i.monthIncome > 0 && i.variable / i.monthIncome > 0.4) {
    out.push({
      level: "warn",
      text: `Despesa variável em ${Math.round((i.variable / i.monthIncome) * 100)}% da renda.`,
      href: "/app/orcamento?new=variable",
    });
  }

  if (i.reserveTarget > 0 && i.reserveSaved / i.reserveTarget < 0.3) {
    const falta = i.reserveTarget - i.reserveSaved;
    out.push({
      level: "warn",
      text: `Reserva em ${Math.round((i.reserveSaved / i.reserveTarget) * 100)}% — faltam ${brl(falta, i.currency)}.`,
      href: "/app/reserva",
    });
  }

  for (const g of i.goals) {
    const falta = g.target - g.saved;
    if (falta <= 0) continue;
    if (!g.deadline) continue;
    const d = daysUntil(g.deadline);
    if (d < 0 || d > 90) continue;
    out.push({
      level: "info",
      text: `Faltam ${brl(falta, i.currency)} pra "${g.name}" — vence em ${d} dia${d === 1 ? "" : "s"}.`,
      href: "/app/metas",
    });
  }

  return out;
}
