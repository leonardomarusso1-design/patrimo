"use client";

import { useState, useTransition } from "react";
import { PiggyBank, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { setInvestPct } from "@/app/app/configuracoes/actions";

const PRESETS = [10, 20, 30, 40, 50];

export function InvestCard({
  income,
  pct,
  currency,
}: {
  income: number;
  pct: number;
  currency: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(pct);
  const [saved, setSaved] = useState(pct);
  const [pending, start] = useTransition();

  const amount = (income * saved) / 100;

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            <PiggyBank className="h-3.5 w-3.5" /> Investir
          </p>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100"
          >
            <Pencil className="h-3 w-3" /> Ajustar
          </button>
        </div>
        <p className="money mt-2 font-display text-2xl font-extrabold text-ink">
          {formatCurrency(amount, currency)}
        </p>
        <p className="mt-1 text-xs text-muted">{saved}% da receita do mês</p>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Quanto investir por mês">
        <p className="text-sm text-muted">
          Uma fatia da sua receita reservada para investir. Acompanha a receita do mês.
        </p>
        <p className="mt-4 text-center font-display text-4xl font-extrabold text-sky-700">
          {value}%
        </p>
        <input
          type="range"
          min={0}
          max={70}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="mt-3 w-full accent-sky-600"
        />
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setValue(p)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                value === p ? "bg-sky-600 text-white" : "bg-ink/[0.05] text-muted"
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          Valor a investir:{" "}
          <strong className="text-ink">{formatCurrency((income * value) / 100, currency)}</strong>
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            loading={pending}
            onClick={() =>
              start(async () => {
                await setInvestPct(value);
                setSaved(value);
                setOpen(false);
              })
            }
          >
            Salvar
          </Button>
        </div>
      </Modal>
    </>
  );
}
