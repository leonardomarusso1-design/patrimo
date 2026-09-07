"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

const PALETTE = [
  "#0B7A55",
  "#16A06C",
  "#4FBF8B",
  "#C98A00",
  "#14211C",
  "#8FCFB0",
  "#5B6660",
  "#0A6A4A",
];

export function Donut({
  data,
  currency = "BRL",
  centerLabel,
}: {
  data: { name: string; value: number }[];
  currency?: string;
  centerLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const rows = data.filter((d) => d.value > 0);

  if (rows.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted">
        Sem dados para exibir.
      </div>
    );
  }

  return (
    <div className="@container">
      <div className="flex flex-col items-center gap-5 @md:flex-row">
        <div className="relative h-40 w-40 shrink-0 sm:h-44 sm:w-44">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={rows}
                dataKey="value"
                innerRadius="66%"
                outerRadius="100%"
                paddingAngle={2}
                stroke="none"
              >
                {rows.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <span className="money font-display text-[0.8rem] font-bold leading-tight text-ink">
              {formatCurrency(total, currency)}
            </span>
            {centerLabel && <span className="text-[0.7rem] text-muted">{centerLabel}</span>}
          </div>
        </div>

        <ul className="w-full min-w-0 flex-1 space-y-1.5">
          {rows.map((d, i) => (
            <li key={d.name} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              <span className="min-w-0 flex-1 truncate text-ink/90">{d.name}</span>
              <span className="shrink-0 tabular-nums text-xs text-muted">
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
