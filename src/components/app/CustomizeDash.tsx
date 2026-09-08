"use client";

import { useState, useTransition } from "react";
import { SlidersHorizontal, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { setDashboardCards } from "@/app/app/configuracoes/actions";

export const DASH_CARDS: { id: string; label: string }[] = [
  { id: "patrimonio", label: "Patrimônio líquido" },
  { id: "investido", label: "Investido na carteira" },
  { id: "reserva", label: "Reserva de emergência" },
  { id: "metas", label: "Guardado em metas" },
  { id: "bens", label: "Valor dos bens" },
  { id: "dividas", label: "Dívidas" },
];

export function CustomizeDash({ selected }: { selected: string[] }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>(selected);
  const [pending, start] = useTransition();

  const toggle = (id: string) =>
    setPicked((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : p.length >= 4 ? p : [...p, id],
    );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" /> Personalizar
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Personalizar visão geral"
        description="Escolha até 4 cards para acompanhar no seu início."
      >
        <div className="space-y-2">
          {DASH_CARDS.map((c) => {
            const on = picked.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm ${
                  on ? "border-brand bg-brand-50 text-brand-700" : "border-border text-ink"
                }`}
              >
                {c.label}
                {on && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            loading={pending}
            onClick={() =>
              start(async () => {
                await setDashboardCards(picked);
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
