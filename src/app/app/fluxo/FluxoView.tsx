"use client";

import { useMemo, useState } from "react";
import { Clock, Repeat } from "lucide-react";
import { buildCashflow, type FlowItem } from "@/lib/cashflow";
import { StatTile } from "@/components/ui/Misc";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Entry = Parameters<typeof buildCashflow>[0][number];

const PERIODS = [30, 60, 90];

function fmtDay(d: string) {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
}

export function FluxoView({ entries, currency }: { entries: Entry[]; currency: string }) {
  const [days, setDays] = useState(30);
  const items = useMemo(() => buildCashflow(entries, days), [entries, days]);

  const realizado = items.filter((i) => i.status === "realizado");
  const previsto = items.filter((i) => i.status === "previsto");
  const entradas = realizado.filter((i) => i.amount > 0).reduce((s, i) => s + i.amount, 0);
  const saidas = realizado.filter((i) => i.amount < 0).reduce((s, i) => s + i.amount, 0);
  const saldoPrevisto = previsto.reduce((s, i) => s + i.amount, 0);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Entradas realizadas" value={formatCurrency(entradas, currency)} />
        <StatTile label="Saídas realizadas" value={formatCurrency(saidas, currency)} />
        <StatTile
          label={`Saldo previsto (${days} dias)`}
          value={formatCurrency(saldoPrevisto, currency)}
          tone="ink"
        />
      </div>

      <div className="mt-5 inline-flex gap-1 rounded-xl bg-ink/[0.05] p-1">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setDays(p)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold",
              days === p ? "bg-card text-brand-700 shadow-[var(--shadow-card)]" : "text-muted",
            )}
          >
            {p} dias
          </button>
        ))}
      </div>

      <Section title="Realizado" subtitle="lançamentos confirmados até hoje" items={realizado} currency={currency} />
      <Section
        title="Previsto"
        subtitle="previstos e recorrências das próximas semanas"
        items={previsto}
        currency={currency}
        muted
      />
    </>
  );
}

function Section({
  title,
  subtitle,
  items,
  currency,
  muted,
}: {
  title: string;
  subtitle: string;
  items: FlowItem[];
  currency: string;
  muted?: boolean;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <p className="font-display text-sm font-bold text-ink">{title}</p>
      <p className="text-xs text-muted">{subtitle}</p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Nada neste período.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {items.map((i, k) => (
            <li key={k} className="flex items-center gap-3 py-2.5 text-sm">
              <span className="w-12 shrink-0 tabular-nums text-xs text-muted">{fmtDay(i.date)}</span>
              {i.source === "recorrencia" && <Repeat className="h-3.5 w-3.5 shrink-0 text-muted" />}
              {muted && i.source === "lancamento" && <Clock className="h-3.5 w-3.5 shrink-0 text-gold" />}
              <span className={cn("flex-1 truncate", muted ? "text-muted" : "text-ink")}>{i.name}</span>
              <span
                className={cn(
                  "shrink-0 tabular-nums",
                  i.amount >= 0 ? "text-success" : "text-danger",
                  muted && "opacity-70",
                )}
              >
                {i.amount >= 0 ? "+" : ""}
                {formatCurrency(i.amount, currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
