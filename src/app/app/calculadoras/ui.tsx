"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Input, Label, Select } from "@/components/ui/Field";
import { formatCurrency, cn } from "@/lib/utils";
import { convert } from "@/lib/fx";
import {
  futureValue,
  requiredMonthlyContribution,
  simpleInterest,
  cdiReturn,
  irRateFixedIncome,
  fireNumber,
  fiftyThirtyTwenty,
  debtPayoffMonths,
  emergencyTarget,
  percentOf,
  whatPercent,
  percentChange,
} from "@/lib/finance";

type MarketProps = {
  rates: Record<string, number>;
  cdiAnnual: number;
  crypto: Record<string, { brl: number; usd: number }>;
};

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2.5 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className={cn("tabular-nums", strong ? "font-display font-bold text-ink" : "text-ink")}>
        {value}
      </span>
    </div>
  );
}

function num(v: string) {
  const n = Number(String(v).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function F({ label, value, onChange, suffix }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Input value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal" />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 sm:grid-cols-2">{children}</div>;
}

/* ---------------------------------------------------------------- calcs --- */

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
    <Shell>
      <div className="space-y-3">
        <F label="Valor inicial" value={initial} onChange={setInitial} suffix="R$" />
        <F label="Aporte mensal" value={monthly} onChange={setMonthly} suffix="R$" />
        <F label="Taxa anual" value={rate} onChange={setRate} suffix="%" />
        <F label="Prazo" value={years} onChange={setYears} suffix="anos" />
      </div>
      <div>
        <Row label="Total investido" value={formatCurrency(r.contributed)} />
        <Row label="Juros acumulados" value={formatCurrency(r.interest)} />
        <Row label="Montante final" value={formatCurrency(r.total)} strong />
      </div>
    </Shell>
  );
}

function JurosSimples() {
  const [principal, setPrincipal] = useState("1000");
  const [rate, setRate] = useState("10");
  const [years, setYears] = useState("5");
  const r = simpleInterest({ principal: num(principal), annualRatePct: num(rate), years: num(years) });
  return (
    <Shell>
      <div className="space-y-3">
        <F label="Valor inicial" value={principal} onChange={setPrincipal} suffix="R$" />
        <F label="Taxa anual" value={rate} onChange={setRate} suffix="%" />
        <F label="Prazo" value={years} onChange={setYears} suffix="anos" />
      </div>
      <div>
        <Row label="Juros" value={formatCurrency(r.interest)} />
        <Row label="Montante final" value={formatCurrency(r.total)} strong />
        <p className="mt-3 text-xs text-muted">
          Sem capitalização: os juros incidem sempre só sobre o valor inicial.
        </p>
      </div>
    </Shell>
  );
}

function PrimeiroMilhao() {
  const [target, setTarget] = useState("1000000");
  const [current, setCurrent] = useState("0");
  const [rate, setRate] = useState("10");
  const [years, setYears] = useState("20");
  const months = num(years) * 12;
  const monthly = requiredMonthlyContribution({
    target: num(target),
    current: num(current),
    annualRatePct: num(rate),
    months,
  });
  return (
    <Shell>
      <div className="space-y-3">
        <F label="Objetivo de patrimônio" value={target} onChange={setTarget} suffix="R$" />
        <F label="Já tenho hoje" value={current} onChange={setCurrent} suffix="R$" />
        <F label="Retorno anual esperado" value={rate} onChange={setRate} suffix="%" />
        <F label="Prazo" value={years} onChange={setYears} suffix="anos" />
      </div>
      <div>
        <Row label="Aporte mensal necessário" value={formatCurrency(monthly)} strong />
        <Row label="Total aportado no período" value={formatCurrency(num(current) + monthly * months)} />
        <Row label="Ganho com juros" value={formatCurrency(Math.max(num(target) - num(current) - monthly * months, 0))} />
      </div>
    </Shell>
  );
}

function Cdi({ cdiAnnual }: { cdiAnnual: number }) {
  const [principal, setPrincipal] = useState("10000");
  const [cdiPct, setCdiPct] = useState("100");
  const [months, setMonths] = useState("12");
  const [kind, setKind] = useState("cdb");
  const r = cdiReturn({
    principal: num(principal),
    cdiPct: num(cdiPct),
    annualCdiPct: cdiAnnual,
    months: num(months),
    taxExempt: kind !== "cdb",
  });
  return (
    <Shell>
      <div className="space-y-3">
        <F label="Valor investido" value={principal} onChange={setPrincipal} suffix="R$" />
        <F label="Percentual do CDI" value={cdiPct} onChange={setCdiPct} suffix="%" />
        <F label="Prazo" value={months} onChange={setMonths} suffix="meses" />
        <div>
          <Label>Tipo</Label>
          <Select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="cdb">CDB / RDB (com IR)</option>
            <option value="lci">LCI / LCA (isento)</option>
          </Select>
        </div>
      </div>
      <div>
        <Row label="CDI atual (a.a.)" value={`${cdiAnnual.toFixed(2)}%`} />
        <Row label="Rendimento bruto" value={formatCurrency(r.grossInterest)} />
        <Row label="IR" value={formatCurrency(r.tax)} />
        <Row label="Valor líquido no final" value={formatCurrency(r.net)} strong />
      </div>
    </Shell>
  );
}

function Reserva() {
  const [expense, setExpense] = useState("3500");
  const [level, setLevel] = useState<"basic" | "shield">("basic");
  const target = emergencyTarget(num(expense), level);
  return (
    <Shell>
      <div className="space-y-3">
        <F label="Custo essencial por mês" value={expense} onChange={setExpense} suffix="R$" />
        <div>
          <Label>Cobertura</Label>
          <Select value={level} onChange={(e) => setLevel(e.target.value as "basic" | "shield")}>
            <option value="basic">6 meses (básico)</option>
            <option value="shield">12 meses (blindado)</option>
          </Select>
        </div>
      </div>
      <div>
        <Row label="Reserva ideal" value={formatCurrency(target)} strong />
        <p className="mt-3 text-xs text-muted">
          Renda estável: 6 meses costuma bastar. Autônomo ou renda variável: mire 12.
        </p>
      </div>
    </Shell>
  );
}

function Porcentagem() {
  const [mode, setMode] = useState("of");
  const [a, setA] = useState("30");
  const [b, setB] = useState("200");
  let result = "";
  if (mode === "of") result = String(percentOf(num(b), num(a)));
  else if (mode === "what") result = `${whatPercent(num(a), num(b)).toFixed(2)}%`;
  else result = `${percentChange(num(a), num(b)).toFixed(2)}%`;
  return (
    <Shell>
      <div className="space-y-3">
        <div>
          <Label>Operação</Label>
          <Select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="of">Quanto é X% de Y</option>
            <option value="what">X representa quantos % de Y</option>
            <option value="change">Variação de X para Y</option>
          </Select>
        </div>
        <F label={mode === "of" ? "Percentual (X)" : "Valor X"} value={a} onChange={setA} />
        <F label={mode === "of" ? "Valor (Y)" : "Valor Y"} value={b} onChange={setB} />
      </div>
      <div>
        <Row label="Resultado" value={result} strong />
      </div>
    </Shell>
  );
}

function Fire() {
  const [expense, setExpense] = useState("8000");
  const [rate, setRate] = useState("4");
  const target = fireNumber(num(expense), num(rate));
  return (
    <Shell>
      <div className="space-y-3">
        <F label="Gasto mensal desejado na aposentadoria" value={expense} onChange={setExpense} suffix="R$" />
        <F label="Taxa de retirada anual" value={rate} onChange={setRate} suffix="%" />
      </div>
      <div>
        <Row label="Renda anual necessária" value={formatCurrency(num(expense) * 12)} />
        <Row label="Patrimônio para viver de renda" value={formatCurrency(target)} strong />
        <p className="mt-3 text-xs text-muted">Regra dos 4% (estudo Trinity).</p>
      </div>
    </Shell>
  );
}

function Cinquenta() {
  const [income, setIncome] = useState("6000");
  const r = fiftyThirtyTwenty(num(income));
  return (
    <Shell>
      <div className="space-y-3">
        <F label="Renda mensal líquida" value={income} onChange={setIncome} suffix="R$" />
      </div>
      <div>
        <Row label="50% — Necessidades" value={formatCurrency(r.needs)} />
        <Row label="30% — Desejos" value={formatCurrency(r.wants)} />
        <Row label="20% — Poupar e investir" value={formatCurrency(r.savings)} strong />
      </div>
    </Shell>
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
    <Shell>
      <div className="space-y-3">
        <F label="Saldo devedor" value={balance} onChange={setBalance} suffix="R$" />
        <F label="Juros ao mês" value={interest} onChange={setInterest} suffix="%" />
        <F label="Pagamento mensal" value={payment} onChange={setPayment} suffix="R$" />
      </div>
      <div>
        {months == null ? (
          <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            O pagamento não cobre nem os juros. Aumente o pagamento ou negocie a taxa.
          </p>
        ) : (
          <>
            <Row label="Tempo para quitar" value={`${months} meses (${(months / 12).toFixed(1)} anos)`} strong />
            <Row label="Total pago" value={formatCurrency(months * num(payment))} />
            <Row label="Juros pagos" value={formatCurrency(months * num(payment) - num(balance))} />
          </>
        )}
      </div>
    </Shell>
  );
}

const MOEDAS = ["BRL", "USD", "EUR", "GBP", "ARS", "JPY", "CAD", "AUD", "CHF"];

function Moedas({ rates }: { rates: Record<string, number> }) {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("BRL");
  const out = convert(num(amount), from, to, rates);
  const unit = convert(1, from, to, rates);
  return (
    <Shell>
      <div className="space-y-3">
        <F label="Valor" value={amount} onChange={setAmount} />
        <div>
          <Label>De</Label>
          <Select value={from} onChange={(e) => setFrom(e.target.value)}>
            {MOEDAS.map((m) => <option key={m}>{m}</option>)}
          </Select>
        </div>
        <div>
          <Label>Para</Label>
          <Select value={to} onChange={(e) => setTo(e.target.value)}>
            {MOEDAS.map((m) => <option key={m}>{m}</option>)}
          </Select>
        </div>
      </div>
      <div>
        <Row label="Convertido" value={`${out.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${to}`} strong />
        <Row label={`1 ${from}`} value={`${unit.toLocaleString("pt-BR", { maximumFractionDigits: 4 })} ${to}`} />
        <p className="mt-3 text-xs text-muted">Cotação comercial, atualizada a cada 6h. Não inclui IOF nem spread.</p>
      </div>
    </Shell>
  );
}

const CRYPTO_LIST = [
  { id: "bitcoin", symbol: "BTC" },
  { id: "ethereum", symbol: "ETH" },
  { id: "solana", symbol: "SOL" },
  { id: "binancecoin", symbol: "BNB" },
  { id: "tether", symbol: "USDT" },
];

function Cripto({ crypto }: { crypto: Record<string, { brl: number; usd: number }> }) {
  const [amount, setAmount] = useState("0,5");
  const [coin, setCoin] = useState("bitcoin");
  const [fiat, setFiat] = useState<"brl" | "usd">("brl");
  const price = crypto[coin]?.[fiat] ?? 0;
  const has = Object.keys(crypto).length > 0;
  const value = num(amount) * price;
  const sym = CRYPTO_LIST.find((c) => c.id === coin)?.symbol ?? "";
  return (
    <Shell>
      <div className="space-y-3">
        <F label="Quantidade" value={amount} onChange={setAmount} suffix={sym} />
        <div>
          <Label>Criptomoeda</Label>
          <Select value={coin} onChange={(e) => setCoin(e.target.value)}>
            {CRYPTO_LIST.map((c) => <option key={c.id} value={c.id}>{c.symbol}</option>)}
          </Select>
        </div>
        <div>
          <Label>Moeda</Label>
          <Select value={fiat} onChange={(e) => setFiat(e.target.value as "brl" | "usd")}>
            <option value="brl">BRL</option>
            <option value="usd">USD</option>
          </Select>
        </div>
      </div>
      <div>
        {has ? (
          <>
            <Row label="Valor" value={`${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${fiat.toUpperCase()}`} strong />
            <Row label={`1 ${sym}`} value={`${price.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${fiat.toUpperCase()}`} />
            <p className="mt-3 text-xs text-muted">Preço à vista (CoinGecko), atualizado a cada 5min.</p>
          </>
        ) : (
          <p className="text-sm text-muted">Cotação indisponível agora. Tente daqui a pouco.</p>
        )}
      </div>
    </Shell>
  );
}

function Dividendos() {
  const [price, setPrice] = useState("30");
  const [qty, setQty] = useState("1000");
  const [dy, setDy] = useState("8");
  const [avg, setAvg] = useState("");
  const invested = num(price) * num(qty);
  const annual = invested * (num(dy) / 100);
  const yoc = num(avg) > 0 ? (annual / (num(avg) * num(qty))) * 100 : null;
  return (
    <Shell>
      <div className="space-y-3">
        <F label="Preço atual da cota/ação" value={price} onChange={setPrice} suffix="R$" />
        <F label="Quantidade" value={qty} onChange={setQty} />
        <F label="Dividend yield anual" value={dy} onChange={setDy} suffix="%" />
        <F label="Preço médio pago (opcional)" value={avg} onChange={setAvg} suffix="R$" />
      </div>
      <div>
        <Row label="Valor investido (a mercado)" value={formatCurrency(invested)} />
        <Row label="Provento anual estimado" value={formatCurrency(annual)} />
        <Row label="Provento mensal médio" value={formatCurrency(annual / 12)} strong />
        {yoc != null && <Row label="Yield on cost" value={`${yoc.toFixed(2)}%`} />}
        <p className="mt-3 text-xs text-muted">
          Estimativa com base no yield informado. Dividendos passados não garantem os futuros.
        </p>
      </div>
    </Shell>
  );
}

function ImpostoRenda() {
  const [profit, setProfit] = useState("1000");
  const [kind, setKind] = useState("rf");
  const [days, setDays] = useState("400");
  let ratePct = 15;
  let note = "";
  if (kind === "rf") {
    ratePct = irRateFixedIncome(num(days));
    note = "Renda fixa: alíquota regressiva de 22,5% (até 180d) a 15% (acima de 720d).";
  } else if (kind === "acoes") {
    ratePct = 15;
    note = "Ações (swing trade): 15% sobre o lucro. Isento se as vendas do mês somam até R$ 20.000.";
  } else if (kind === "fii") {
    ratePct = 20;
    note = "FIIs: 20% sobre o ganho de capital na venda. Os rendimentos mensais são isentos.";
  } else {
    ratePct = 15;
    note = "Cripto: 15% sobre o ganho. Isento se as vendas do mês somam até R$ 35.000.";
  }
  const tax = num(profit) * (ratePct / 100);
  return (
    <Shell>
      <div className="space-y-3">
        <F label="Lucro / ganho de capital" value={profit} onChange={setProfit} suffix="R$" />
        <div>
          <Label>Tipo de investimento</Label>
          <Select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="rf">Renda fixa (CDB, Tesouro)</option>
            <option value="acoes">Ações</option>
            <option value="fii">Fundos imobiliários</option>
            <option value="cripto">Criptomoedas</option>
          </Select>
        </div>
        {kind === "rf" && <F label="Prazo da aplicação" value={days} onChange={setDays} suffix="dias" />}
      </div>
      <div>
        <Row label="Alíquota" value={`${ratePct}%`} />
        <Row label="Imposto devido" value={formatCurrency(tax)} strong />
        <Row label="Líquido no bolso" value={formatCurrency(num(profit) - tax)} />
        <p className="mt-3 text-xs text-muted">{note}</p>
      </div>
    </Shell>
  );
}

/* --------------------------------------------------------------- picker --- */

type CalcDef = {
  id: string;
  name: string;
  desc: string;
  slug?: string; // artigo no blog
  render: (m: MarketProps) => React.ReactNode;
};

const CALCS: CalcDef[] = [
  { id: "juros", name: "Juros compostos", desc: "Quanto seu dinheiro vira com aportes e juros sobre juros.", slug: "juros-compostos", render: () => <JurosCompostos /> },
  { id: "juros-simples", name: "Juros simples", desc: "Crescimento sem capitalização, taxa fixa sobre o valor inicial.", slug: "juros-simples", render: () => <JurosSimples /> },
  { id: "primeiro-milhao", name: "Primeiro milhão", desc: "Quanto poupar por mês pra chegar num objetivo de patrimônio.", slug: "primeiro-milhao", render: () => <PrimeiroMilhao /> },
  { id: "fire", name: "Independência financeira", desc: "Patrimônio necessário pra viver de renda pela regra dos 4%.", slug: "regra-dos-4-por-cento", render: () => <Fire /> },
  { id: "cdi", name: "Rendimento do CDI", desc: "Quanto rende um CDB/LCI atrelado ao CDI, líquido de IR.", slug: "quanto-rende-o-cdi", render: (m) => <Cdi cdiAnnual={m.cdiAnnual} /> },
  { id: "reserva", name: "Reserva de emergência", desc: "Quanto guardar pra cobrir 6 ou 12 meses de custo essencial.", slug: "reserva-de-emergencia-6-ou-12-meses", render: () => <Reserva /> },
  { id: "porcentagem", name: "Porcentagem", desc: "Quanto é X% de Y, proporção e variação percentual.", slug: "como-calcular-porcentagem", render: () => <Porcentagem /> },
  { id: "503020", name: "Regra 50-30-20", desc: "Divide sua renda em necessidades, desejos e poupança.", slug: "regra-50-30-20", render: () => <Cinquenta /> },
  { id: "divida", name: "Quitação de dívida", desc: "Em quanto tempo você quita e quanto paga de juros.", slug: "como-sair-das-dividas", render: () => <Divida /> },
  { id: "moedas", name: "Conversor de moedas", desc: "Converte entre moedas com a cotação comercial do dia.", slug: "conversao-de-moedas", render: (m) => <Moedas rates={m.rates} /> },
  { id: "cripto", name: "Conversor de cripto", desc: "Valor de BTC, ETH e outras em real ou dólar.", slug: "converter-criptomoedas", render: (m) => <Cripto crypto={m.crypto} /> },
  { id: "dividendos", name: "Calculadora de dividendos", desc: "Renda passiva estimada a partir do dividend yield.", slug: "calcular-dividendos", render: () => <Dividendos /> },
  { id: "ir", name: "IR sobre investimentos", desc: "Alíquota e imposto devido por tipo de aplicação.", slug: "imposto-de-renda-investimentos", render: () => <ImpostoRenda /> },
];

export function Calculadoras(market: MarketProps) {
  const [active, setActive] = useState<string | null>(null);
  const calc = CALCS.find((c) => c.id === active);

  if (!calc) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CALCS.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className="rounded-2xl border border-border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-colors hover:border-brand/40"
          >
            <p className="font-display text-sm font-bold text-ink">{c.name}</p>
            <p className="mt-1 text-xs text-muted">{c.desc}</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setActive(null)}
        className="inline-flex items-center gap-1.5 text-sm text-accent-dim hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Todas as calculadoras
      </button>

      <div className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">{calc.name}</h2>
            <p className="mt-0.5 text-sm text-muted">{calc.desc}</p>
          </div>
          {calc.slug && (
            <Link
              href={`/blog/${calc.slug}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:border-brand/40 hover:text-brand"
            >
              <BookOpen className="h-3.5 w-3.5" /> Entenda
            </Link>
          )}
        </div>
        {calc.render(market)}
      </div>
    </div>
  );
}
