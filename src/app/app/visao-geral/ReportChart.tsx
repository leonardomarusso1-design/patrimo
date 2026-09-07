"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export function ReportChart({
  data,
  currency,
}: {
  data: { month: string; receita: number; gastos: number }[];
  currency: string;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="r" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1F9D55" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#1F9D55" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E23F5C" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#E23F5C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E7E2D8" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#6B6560", fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fill: "#6B6560", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={72}
            tickFormatter={(v) => formatCurrency(v, currency).replace(/\s?[A-Z]{3}$/, "")}
          />
          <Tooltip
            formatter={(v) => formatCurrency(Number(v), currency)}
            contentStyle={{ borderRadius: 12, border: "1px solid #E7E2D8" }}
          />
          <Area type="monotone" dataKey="receita" stroke="#1F9D55" fill="url(#r)" strokeWidth={2} />
          <Area type="monotone" dataKey="gastos" stroke="#E23F5C" fill="url(#g)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
