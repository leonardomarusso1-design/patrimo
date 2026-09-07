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
              <stop offset="0%" stopColor="#0B7A55" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#0B7A55" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D64545" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#D64545" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E4E8E2" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#5B6660", fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fill: "#5B6660", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={72}
            tickFormatter={(v) => formatCurrency(v, currency).replace(/\s?[A-Z]{3}$/, "")}
          />
          <Tooltip
            formatter={(v) => formatCurrency(Number(v), currency)}
            contentStyle={{ borderRadius: 12, border: "1px solid #E4E8E2" }}
          />
          <Area type="monotone" dataKey="receita" stroke="#0B7A55" fill="url(#r)" strokeWidth={2} />
          <Area type="monotone" dataKey="gastos" stroke="#D64545" fill="url(#g)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
