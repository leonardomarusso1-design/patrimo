"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { parseExtratoCsv, type ParsedTxn } from "@/lib/csv";
import { importBudgetCsv, type ImportState } from "@/app/app/orcamento/actions";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { formatCurrency } from "@/lib/utils";

type Draft = ParsedTxn & {
  kind: "income" | "expense_fixed" | "expense_variable";
  category: string;
  include: boolean;
};

const empty: ImportState = {};

export function ImportCsv({ referenceMonth }: { referenceMonth: string }) {
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [state, action, pending] = useActionState(importBudgetCsv, empty);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // fecha o modal quando a Server Action confirma a importação
    if (state.inserted != null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
      setDrafts([]);
    }
  }, [state.inserted]);

  const onFile = async (file: File) => {
    const text = await file.text();
    const txns = parseExtratoCsv(text);
    setDrafts(
      txns.map((t) => ({
        ...t,
        kind: t.amount >= 0 ? "income" : "expense_variable",
        category: "",
        include: true,
      })),
    );
  };

  const payload = JSON.stringify({
    reference_month: referenceMonth,
    items: drafts
      .filter((d) => d.include)
      .map((d) => ({
        kind: d.kind,
        name: d.description,
        category: d.category || null,
        amount: Math.abs(d.amount),
        due_day: d.date ? Number(d.date.slice(8, 10)) || null : null,
      })),
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:border-brand/40 hover:text-brand"
      >
        <Upload className="h-3.5 w-3.5" /> Importar extrato
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Importar extrato (CSV)"
        description="Exporte o extrato do banco em CSV. Detecto data, descrição e valor."
        className="max-w-2xl"
      >
        {drafts.length === 0 ? (
          <div className="space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
            <Button variant="secondary" className="w-full" onClick={() => fileRef.current?.click()}>
              Escolher arquivo CSV
            </Button>
            <p className="text-xs text-muted">
              Valores negativos entram como despesa variável; positivos, como receita.
              Você ajusta tipo e categoria antes de confirmar.
            </p>
          </div>
        ) : (
          <form action={action} className="space-y-3">
            <input type="hidden" name="payload" value={payload} />
            {state.error && (
              <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
                {state.error}
              </p>
            )}
            <div className="max-h-72 space-y-1.5 overflow-y-auto rounded-xl border border-border p-2">
              {drafts.map((d, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg bg-surface p-2 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={d.include}
                    onChange={(e) =>
                      setDrafts((s) =>
                        s.map((x, j) => (j === i ? { ...x, include: e.target.checked } : x)),
                      )
                    }
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{d.description}</p>
                    <div className="mt-1 flex gap-1.5">
                      <Select
                        value={d.kind}
                        onChange={(e) =>
                          setDrafts((s) =>
                            s.map((x, j) =>
                              j === i ? { ...x, kind: e.target.value as Draft["kind"] } : x,
                            ),
                          )
                        }
                        className="h-7 w-auto py-0 text-xs"
                      >
                        <option value="income">Receita</option>
                        <option value="expense_fixed">Despesa fixa</option>
                        <option value="expense_variable">Despesa variável</option>
                      </Select>
                      <Input
                        value={d.category}
                        onChange={(e) =>
                          setDrafts((s) =>
                            s.map((x, j) => (j === i ? { ...x, category: e.target.value } : x)),
                          )
                        }
                        placeholder="categoria"
                        className="h-7 w-28 py-0 text-xs"
                      />
                    </div>
                  </div>
                  <span
                    className={
                      d.amount >= 0 ? "tabular-nums text-success" : "tabular-nums text-danger"
                    }
                  >
                    {formatCurrency(d.amount)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between gap-2">
              <Button type="button" variant="ghost" onClick={() => setDrafts([])}>
                Trocar arquivo
              </Button>
              <Button type="submit" loading={pending}>
                Importar {drafts.filter((d) => d.include).length} lançamentos
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
