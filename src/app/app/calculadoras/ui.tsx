"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/Field";
import { formatCurrency, cn } from "@/lib/utils";
import {
  futureValue,
  fireNumber,
  fiftyThirtyTwenty,
  debtPayoffMonths,
} from "@/lib/finance";

const TABS = [
  { id: "juros", label: "Juros compostos" },
  { id: "fire", label: "Independência financeira" },
  { id: "divida", label: "Quitação de dívida" },
  { id: "503020", label: "Regra 50-30-20" },
] as const;

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className={strong ? "font-display font-bold text-ink" : "text-ink"}>{value}</span>
    </div>
  );
}

function num(v: string) {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function Calculadoras() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("juros");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              tab === t.id ? "bg-ink text-[#f7f5f1]" : "bg-card text-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        {tab === "juros" && <JurosCompostos />}
        {tab === "fire" && <Fire />}
        {tab === "divida" && <Divida />}
        {tab === "503020" && <Cinquenta />}
      </div>
    </div>
  );
}

function JurosCompostos() {
  const [initial, setInitial] = useState("1000");
  const [monthly, setMonthly] = useState("500");
  const [rate, setRate] = useState("10");
  const [years, setYears] = useState("20");
  const r = futureValue({
    initial: num(initial),
    monthlyContribution: num(monthly),
    annualRatePct: num(rate),
    years: num(years),
  });
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-3">
        <div><Label>Valor inicial (R$)</Label><Input value={initial} onChange={(e) => setInitial(e.target.value)} /></div>
        <div><Label>Aporte mensal (R$)</Label><Input value={monthly} onChange={(e) => setMonthly(e.target.value)} /></div>
        <div><Label>Taxa anual (%)</Label><Input value={rate} onChange={(e) => setRate(e.target.value)} /></div>
        <div><Label>Prazo (anos)</Label><Input value={years} onChange={(e) => setYears(e.target.value)} /></div>
      </div>
      <div>
        <Row label="Total investido" value={formatCurrency(r.contributed)} />
        <Row label="Juros acumulados" value={formatCurrency(r.interest)} />
        <Row label="Montante final" value={formatCurrency(r.total)} strong />
      </div>
    </div>
  );
}

function Fire() {
  const [expense, setExpense] = useState("8000");
  const [rate, setRate] = useState("4");
  const target = fireNumber(num(expense), num(rate));
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-3">
        <div><Label>Gasto mensal desejado na aposentadoria (R$)</Label><Input value={expense} onChange={(e) => setExpense(e.target.value)} /></div>
        <div><Label>Taxa de retirada anual (%)</Label><Input value={rate} onChange={(e) => setRate(e.target.value)} /></div>
      </div>
      <div>
        <Row label="Renda anual necessária" value={formatCurrency(num(expense) * 12)} />
        <Row label="Patrimônio para viver de renda" value={formatCurrency(target)} strong />
        <p className="mt-3 text-xs text-muted">
          Regra dos 4% (estudo Trinity). Ajuste a taxa de retirada conforme seu cenário.
        </p>
      </div>
    </div>
  );
}

function Divida() {
  const [balance, setBalance] = useState("5000");
  const [interest, setInterest] = useState("8");
  const [payment, setPayment] = useState("600");
  const months = debtPayoffMonths({
    balance: num(balance),
    monthlyInterestPct: num(interest),
    monthlyPayment: num(payment),
  });
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-3">
        <div><Label>Saldo devedor (R$)</Label><Input value={balance} onChange={(e) => setBalance(e.target.value)} /></div>
        <div><Label>Juros ao mês (%)</Label><Input value={interest} onChange={(e) => setInterest(e.target.value)} /></div>
        <div><Label>Pagamento mensal (R$)</Label><Input value={payment} onChange={(e) => setPayment(e.target.value)} /></div>
      </div>
      <div>
        {months == null ? (
          <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            O pagamento não cobre nem os juros. A dívida cresce. Aumente o pagamento ou
            negocie a taxa.
          </p>
        ) : (
          <>
            <Row label="Tempo para quitar" value={`${months} meses (${(months / 12).toFixed(1)} anos)`} strong />
            <Row label="Total pago" value={formatCurrency(months * num(payment))} />
            <Row label="Juros pagos" value={formatCurrency(months * num(payment) - num(balance))} />
          </>
        )}
      </div>
    </div>
  );
}

function Cinquenta() {
  const [income, setIncome] = useState("6000");
  const r = fiftyThirtyTwenty(num(income));
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-3">
        <div><Label>Renda mensal líquida (R$)</Label><Input value={income} onChange={(e) => setIncome(e.target.value)} /></div>
      </div>
      <div>
        <Row label="50% — Necessidades" value={formatCurrency(r.needs)} />
        <Row label="30% — Desejos" value={formatCurrency(r.wants)} />
        <Row label="20% — Poupar e investir" value={formatCurrency(r.savings)} strong />
      </div>
    </div>
  );
}
