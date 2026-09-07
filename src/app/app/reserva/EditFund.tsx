"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { saveEmergencyFund, type ReservaState } from "./actions";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const empty: ReservaState = {};

export function EditFund({
  level,
  cost,
}: {
  level: "basic" | "shield";
  cost: number;
}) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(level);
  const [state, action, pending] = useActionState(saveEmergencyFund, empty);

  useEffect(() => {
    // fecha o modal quando a Server Action confirma o salvamento
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state.ok) setOpen(false);
  }, [state.ok]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted hover:bg-ink/[0.06] hover:text-ink"
      >
        <Pencil className="h-4 w-4" /> Editar
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Editar reserva de emergência">
        <form action={action} className="space-y-4">
          <input type="hidden" name="protection_level" value={sel} />
          {state.error && (
            <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
              {state.error}
            </p>
          )}
          <div>
            <Label>Nível de proteção</Label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { id: "basic", title: "Básico", months: "6 meses", hint: "Renda estável (CLT, servidor)" },
                  { id: "shield", title: "Blindado", months: "12 meses", hint: "Autônomo, PJ ou com dependentes" },
                ] as const
              ).map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setSel(opt.id)}
                  className={cn(
                    "rounded-xl border p-3 text-left",
                    sel === opt.id ? "border-accent bg-accent/5" : "border-border",
                  )}
                >
                  <p className="font-display text-sm font-bold text-ink">{opt.title}</p>
                  <p className="text-xs font-semibold text-accent-dim">{opt.months}</p>
                  <p className="mt-1 text-xs text-muted">{opt.hint}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="essential_monthly_cost">Custo de vida essencial (por mês)</Label>
            <Input
              id="essential_monthly_cost"
              name="essential_monthly_cost"
              type="number"
              step="0.01"
              min={0}
              defaultValue={cost || ""}
              placeholder="Só o essencial: aluguel, contas, mercado, transporte, saúde"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
