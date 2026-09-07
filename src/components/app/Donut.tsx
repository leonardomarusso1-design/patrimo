"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

const PALETTE = [
  "#FF4D6D",
  "#8B5CF6",
  "#1F9D55",
  "#D98A00",
  "#17141A",
  "#E23F5C",
  "#6B6560",
  "#3B82F6",
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
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              innerRadius={54}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {rows.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-sm font-bold text-ink">
            {formatCurrency(total, currency)}
          </span>
          {centerLabel && <span className="text-xs text-muted">{centerLabel}</span>}
        </div>
      </div>
      <ul className="flex-1 space-y-1.5">
        {rows.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              <span className="text-ink/90">{d.name}</span>
            </span>
            <span className="text-muted">
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
