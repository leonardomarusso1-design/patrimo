"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Clock3, Sparkles, Target, TrendingUp } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

const MONEY = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function InteractiveDemo() {
  const [income, setIncome] = useState(6500);
  const [essential, setEssential] = useState(3200);
  const [goal, setGoal] = useState(12000);
  const [goalMonths, setGoalMonths] = useState(12);

  const result = useMemo(() => {
    const monthlyCapacity = Math.max(income - essential, 0);
    const suggested = Math.min(monthlyCapacity * 0.35, goal / goalMonths);
    const reserveTarget = essential * 6;
    const monthsToReserve = monthlyCapacity ? Math.ceil(reserveTarget / monthlyCapacity) : 0;
    const score = Math.min(98, Math.round((monthlyCapacity / Math.max(income, 1)) * 100 + 38));
    return { monthlyCapacity, suggested, reserveTarget, monthsToReserve, score };
  }, [income, essential, goal, goalMonths]);

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-ink/10 bg-card p-5 shadow-[0_30px_80px_-35px_rgba(20,33,28,0.45)] sm:p-7">
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> Diagnóstico rápido
            </span>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-ink">Veja seu próximo passo</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted">Uma simulação simples para sentir como o Patrimo transforma números em decisão.</p>
          </div>
          <div className="hidden rounded-2xl bg-ink p-3 text-right text-[#eaf5ee] sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#eaf5ee]/55">Índice de clareza</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{result.score}<span className="text-base text-accent">%</span></p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <RangeField label="Renda mensal" value={income} min={2500} max={30000} step={500} onChange={setIncome} />
          <RangeField label="Custo essencial" value={essential} min={1200} max={15000} step={200} onChange={setEssential} />
          <RangeField label="Meta que você quer alcançar" value={goal} min={3000} max={60000} step={1000} onChange={setGoal} />
          <RangeField label="Prazo da meta" value={goalMonths} min={3} max={36} step={1} onChange={setGoalMonths} format={(v) => `${v} meses`} />
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Metric icon={TrendingUp} label="Livre por mês" value={MONEY.format(result.monthlyCapacity)} />
          <Metric icon={Target} label="Aporte sugerido" value={MONEY.format(result.suggested)} />
          <Metric icon={Clock3} label="Reserva em" value={result.monthsToReserve ? `${result.monthsToReserve} meses` : "ajuste os dados"} />
        </div>

        <div className="mt-7 flex flex-col gap-3 rounded-2xl bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-brand-700">Seu alvo de reserva: {MONEY.format(result.reserveTarget)}</p>
            <p className="mt-1 text-xs text-brand-700/70">No app, você acompanha isso junto de gastos, metas e patrimônio líquido.</p>
          </div>
          <ButtonLink href="/cadastro" size="sm" className="shrink-0">
            Fazer meu diagnóstico <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function RangeField({ label, value, min, max, step, onChange, format = (v: number) => MONEY.format(v) }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void; format?: (value: number) => string }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3 text-xs font-bold text-ink">
        <span>{label}</span>
        <span className="rounded-full bg-surface px-2.5 py-1 text-brand-700">{format(value)}</span>
      </div>
      <input className="mt-3 w-full accent-brand" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <Icon className="h-4 w-4 text-brand" />
      <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-lg font-extrabold text-ink">{value}</p>
    </div>
  );
}

export function ComingSoonPill() {
  return <span className="inline-flex rounded-full border border-brand/20 bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">Em breve</span>;
}

export function FeatureTab({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${active ? "bg-ink text-[#eaf5ee] shadow-sm" : "text-muted hover:bg-card hover:text-ink"}`}>{label}</button>;
}
