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

/** Juros simples: montante = capital * (1 + i*n), sem capitalização. */
export function simpleInterest(opts: {
  principal: number;
  annualRatePct: number;
  years: number;
}): { total: number; interest: number } {
  const interest = opts.principal * (opts.annualRatePct / 100) * opts.years;
  return { total: opts.principal + interest, interest };
}

/** Alíquota regressiva de IR para renda fixa, por prazo em dias. */
export function irRateFixedIncome(days: number): number {
  if (days <= 180) return 22.5;
  if (days <= 360) return 20;
  if (days <= 720) return 17.5;
  return 15;
}

/**
 * Rendimento de um título atrelado ao CDI, líquido de IR (renda fixa tributável).
 * `cdiPct` = % do CDI (ex.: 100, 110). `annualCdiPct` = CDI a.a. (ex.: 10.65).
 * `taxExempt` = LCI/LCA/poupança (sem IR).
 */
export function cdiReturn(opts: {
  principal: number;
  cdiPct: number;
  annualCdiPct: number;
  months: number;
  taxExempt?: boolean;
}): { gross: number; net: number; grossInterest: number; tax: number } {
  const yearly = (opts.annualCdiPct / 100) * (opts.cdiPct / 100);
  const monthly = Math.pow(1 + yearly, 1 / 12) - 1;
  const gross = opts.principal * Math.pow(1 + monthly, Math.max(opts.months, 0));
  const grossInterest = gross - opts.principal;
  const tax = opts.taxExempt
    ? 0
    : grossInterest * (irRateFixedIncome(opts.months * 30) / 100);
  return { gross, net: gross - tax, grossInterest, tax };
}

/** Operações de porcentagem. */
export function percentOf(base: number, pct: number): number {
  return (base * pct) / 100;
}
export function whatPercent(part: number, whole: number): number {
  return whole === 0 ? 0 : (part / whole) * 100;
}
export function percentChange(from: number, to: number): number {
  return from === 0 ? 0 : ((to - from) / from) * 100;
}
