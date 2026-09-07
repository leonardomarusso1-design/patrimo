/**
 * Calculadoras financeiras puras. Sem dependência de UI.
 * Todas retornam números; a formatação fica com formatCurrency.
 */

/** Montante futuro com aportes mensais e juros compostos mensais. */
export function futureValue(opts: {
  initial: number;
  monthlyContribution: number;
  annualRatePct: number;
  years: number;
}): { total: number; contributed: number; interest: number } {
  const i = opts.annualRatePct / 100 / 12;
  const n = Math.round(opts.years * 12);
  let balance = opts.initial;
  for (let m = 0; m < n; m++) {
    balance = balance * (1 + i) + opts.monthlyContribution;
  }
  const contributed = opts.initial + opts.monthlyContribution * n;
  return {
    total: balance,
    contributed,
    interest: balance - contributed,
  };
}

/** Aporte mensal necessário para atingir um alvo. */
export function requiredMonthlyContribution(opts: {
  target: number;
  current: number;
  annualRatePct: number;
  months: number;
}): number {
  const { target, current, months } = opts;
  if (months <= 0) return Math.max(target - current, 0);
  const i = opts.annualRatePct / 100 / 12;
  if (i === 0) return Math.max((target - current) / months, 0);
  const fvCurrent = current * Math.pow(1 + i, months);
  const factor = (Math.pow(1 + i, months) - 1) / i;
  return Math.max((target - fvCurrent) / factor, 0);
}

/** Reserva de emergência: 6 meses (básico) ou 12 (blindado) do custo essencial. */
export function emergencyTarget(
  essentialMonthlyCost: number,
  level: "basic" | "shield",
): number {
  return essentialMonthlyCost * (level === "shield" ? 12 : 6);
}

/** Número da independência financeira pela regra dos 4% (taxa de retirada). */
export function fireNumber(monthlyExpense: number, withdrawalRatePct = 4): number {
  return (monthlyExpense * 12) / (withdrawalRatePct / 100);
}

/** Divisão 50-30-20 de uma renda. */
export function fiftyThirtyTwenty(income: number) {
  return {
    needs: income * 0.5,
    wants: income * 0.3,
    savings: income * 0.2,
  };
}

/** Simulação bola de neve / avalanche de quitação de dívidas. */
export function debtPayoffMonths(opts: {
  balance: number;
  monthlyInterestPct: number;
  monthlyPayment: number;
}): number | null {
  let { balance } = opts;
  const i = opts.monthlyInterestPct / 100;
  const pmt = opts.monthlyPayment;
  if (pmt <= balance * i) return null; // pagamento não cobre os juros
  let months = 0;
  while (balance > 0 && months < 1200) {
    balance = balance * (1 + i) - pmt;
    months++;
  }
  return months;
}
