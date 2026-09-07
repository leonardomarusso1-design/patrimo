"use client";

import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ImportCsv } from "@/components/app/ImportCsv";
import { clearBudgetMonth } from "@/app/app/orcamento/actions";

export type BudgetTab = { key: string; label: string; total: string; node: ReactNode };

export function BudgetTabs({
  tabs,
  referenceMonth,
  monthLabel,
}: {
  tabs: BudgetTab[];
  referenceMonth: string;
  monthLabel: string;
}) {
  const [active, setActive] = useState(tabs[0]?.key);
  const [confirmClear, setConfirmClear] = useState(false);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                active === t.key
                  ? "bg-brand-50 text-brand-700"
                  : "text-muted hover:text-ink",
              )}
            >
              {t.label}
              <span className="ml-1.5 text-xs text-muted">{t.total}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <ImportCsv referenceMonth={referenceMonth} />
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
