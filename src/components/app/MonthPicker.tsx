"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function shiftMonth(key: string, delta: number) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthPicker({
  month,
  label,
  range,
}: {
  month: string; // YYYY-MM
  label: string;
  range?: { from: string; to: string } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(Number(month.split("-")[0]));
  const [from, setFrom] = useState(range?.from ?? "");
  const [to, setTo] = useState(range?.to ?? "");
  const activeMonth = Number(month.split("-")[1]);

  const goMonth = (ym: string) => {
    router.push(`/app/orcamento?m=${ym}`);
    setOpen(false);
  };
  const goRange = () => {
    if (!from || !to) return;
    router.push(`/app/orcamento?from=${from}&to=${to}`);
    setOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-1 rounded-full border border-border bg-card px-1 py-1">
        <button
          onClick={() => goMonth(shiftMonth(month, -1))}
          className="rounded-full p-1.5 hover:bg-ink/[0.05]"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-medium hover:bg-ink/[0.05]"
        >
          <Calendar className="h-3.5 w-3.5 text-muted" />
          {range ? `${fmt(range.from)} – ${fmt(range.to)}` : label}
        </button>
        <button
          onClick={() => goMonth(shiftMonth(month, 1))}
          className="rounded-full p-1.5 hover:bg-ink/[0.05]"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Escolher período">
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <button
                onClick={() => setYear((y) => y - 1)}
                className="rounded-lg p-1.5 hover:bg-ink/[0.05]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-display text-sm font-bold text-ink">{year}</span>
              <button
                onClick={() => setYear((y) => y + 1)}
                className="rounded-lg p-1.5 hover:bg-ink/[0.05]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {MESES.map((mes, i) => {
                const ym = `${year}-${String(i + 1).padStart(2, "0")}`;
                const active = !range && i + 1 === activeMonth && year === Number(month.split("-")[0]);
                return (
                  <button
                    key={mes}
                    onClick={() => goMonth(ym)}
                    className={cn(
                      "rounded-lg py-2 text-sm",
                      active
                        ? "bg-brand text-[#eaf5ee]"
                        : "bg-surface text-ink hover:bg-ink/[0.06]",
                    )}
                  >
                    {mes}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-2 font-display text-sm font-bold text-ink">Personalizado</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="from">De</Label>
                <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="to">Até</Label>
                <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
            <Button
              className="mt-3 w-full"
              variant="secondary"
              disabled={!from || !to}
              onClick={goRange}
            >
              Aplicar período
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function fmt(d: string) {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
}
