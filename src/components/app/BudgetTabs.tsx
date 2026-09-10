"use client";

import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ImportCsv } from "@/components/app/ImportCsv";
import { clearBudgetMonth } from "@/app/app/orcamento/actions";

export type BudgetTab = { key: string; label: string; total: string; node: ReactNode };

// cor leve por tipo de lançamento
const TINT: Record<string, { active: string; idle: string }> = {
  income: {
    active: "border-emerald-400 bg-emerald-50 text-emerald-700",
    idle: "border-transparent text-emerald-700/60 hover:bg-emerald-50",
  },
  fixed: {
    active: "border-sky-400 bg-sky-50 text-sky-700",
    idle: "border-transparent text-sky-700/60 hover:bg-sky-50",
  },
  variable: {
    active: "border-amber-400 bg-amber-50 text-amber-700",
    idle: "border-transparent text-amber-700/60 hover:bg-amber-50",
  },
};
const FALLBACK_TINT = {
  active: "border-brand bg-card text-brand-700",
  idle: "border-transparent text-muted hover:bg-card/60 hover:text-ink",
};

type Opt = { value: string; label: string };

export function BudgetTabs({
  tabs,
  referenceMonth,
  monthLabel,
  initialTab,
  accounts = [],
  cards = [],
}: {
  tabs: BudgetTab[];
  referenceMonth: string;
  monthLabel: string;
  initialTab?: string;
  accounts?: Opt[];
  cards?: Opt[];
}) {
  const [active, setActive] = useState(
    tabs.some((t) => t.key === initialTab) ? initialTab : tabs[0]?.key,
  );
  const [confirmClear, setConfirmClear] = useState(false);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto rounded-xl bg-ink/[0.05] p-1">
          {tabs.map((t) => {
            const tint = TINT[t.key] ?? FALLBACK_TINT;
            const on = active === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors",
                  on ? `${tint.active} shadow-[var(--shadow-card)]` : tint.idle,
                )}
              >
                {t.label}
                <span className="ml-1.5 hidden text-xs font-medium opacity-70 sm:inline">
                  {t.total}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <ImportCsv referenceMonth={referenceMonth} accounts={accounts} cards={cards} />
          <button
            onClick={() => setConfirmClear(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:border-danger/40 hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" /> Limpar lançamentos
          </button>
        </div>
      </div>

      <div className="mt-5">{current?.node}</div>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title={`Limpar ${monthLabel}?`}
        description="Apaga todos os lançamentos (receitas e despesas) deste mês. Não dá para desfazer."
      >
        <form
          action={async (fd) => {
            await clearBudgetMonth(fd);
            setConfirmClear(false);
          }}
          className="flex justify-end gap-2"
        >
          <input type="hidden" name="reference_month" value={referenceMonth} />
          <Button type="button" variant="ghost" onClick={() => setConfirmClear(false)}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger">
            Limpar tudo
          </Button>
        </form>
      </Modal>
    </div>
  );
}
