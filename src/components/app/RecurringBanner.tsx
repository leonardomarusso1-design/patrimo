"use client";

import { useState, useTransition } from "react";
import { Repeat } from "lucide-react";
import { carryRecurring } from "@/app/app/orcamento/actions";

export function RecurringBanner({
  count,
  refMonth,
  monthLabel,
}: {
  count: number;
  refMonth: string;
  monthLabel: string;
}) {
  const [pending, start] = useTransition();
  const [hidden, setHidden] = useState(false);
  if (count <= 0 || hidden) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/30 bg-brand-50 p-4 text-sm">
      <span className="flex items-center gap-2 text-brand-700">
        <Repeat className="h-4 w-4" />
        {count} lançamento{count === 1 ? "" : "s"} recorrente{count === 1 ? "" : "s"} do mês
        passado ainda não {count === 1 ? "está" : "estão"} em {monthLabel}.
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await carryRecurring(refMonth);
            setHidden(true);
          })
        }
        className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-[#eaf5ee] hover:bg-brand-600"
      >
        Trazer para {monthLabel}
      </button>
    </div>
  );
}
