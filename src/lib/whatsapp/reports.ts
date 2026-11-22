import { addDaysIso } from "./text";

export type EntryRow = {
  kind: "income" | "expense_fixed" | "expense_variable" | string;
  name: string;
  category: string | null;
  amount: number;
  pending: boolean;
  entry_date: string | null;
  due_day: number | null;
  reference_month: string;
};

export type MonthTotals = {
  income: number;
  fixed: number;
  variable: number;
  balance: number;
  top: { name: string; amount: number }[];
};

export function monthTotals(rows: EntryRow[], filter?: string | null): MonthTotals {
  const needle = filter?.trim().toLowerCase();
  const used = rows.filter((r) => {
    if (r.pending) return false;
    if (!needle) return true;
    const hay = `${r.name} ${r.category ?? ""}`.toLowerCase();
    return hay.includes(needle);
  });
  const sum = (k: string) => used.filter((r) => r.kind === k).reduce((s, r) => s + Number(r.amount), 0);
  const income = sum("income");
  const fixed = sum("expense_fixed");
  const variable = sum("expense_variable");
  const byCat = new Map<string, number>();
  for (const r of used) {
    if (r.kind === "income") continue;
    const key = r.category?.trim() || "Sem categoria";
    byCat.set(key, (byCat.get(key) ?? 0) + Number(r.amount));
  }
  const top = [...byCat.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, amount]) => ({ name, amount }));
  return { income, fixed, variable, balance: income - fixed - variable, top };
}

export function entryDueIso(r: EntryRow): string | null {
  if (r.entry_date) return r.entry_date.slice(0, 10);
  if (!r.due_day) return null;
  const day = Math.min(Math.max(r.due_day, 1), 28);
  return `${r.reference_month.slice(0, 7)}-${String(day).padStart(2, "0")}`;
}

export function billsBetween(rows: EntryRow[], fromIso: string, toIso: string): EntryRow[] {
  return rows
    .filter((r) => r.pending && r.kind !== "income")
    .map((r) => ({ r, d: entryDueIso(r) }))
    .filter((x): x is { r: EntryRow; d: string } => Boolean(x.d && x.d >= fromIso && x.d <= toIso))
    .sort((a, b) => a.d.localeCompare(b.d))
    .map((x) => x.r);
}

export function spentBetween(rows: EntryRow[], fromIso: string, toIso: string): { total: number; byCat: Map<string, number> } {
  const byCat = new Map<string, number>();
  let total = 0;
  for (const r of rows) {
    if (r.pending || r.kind === "income") continue;
    const d = entryDueIso(r);
    if (!d || d < fromIso || d > toIso) continue;
    total += Number(r.amount);
    const key = r.category?.trim() || "Sem categoria";
    byCat.set(key, (byCat.get(key) ?? 0) + Number(r.amount));
  }
  return { total, byCat };
}

export function grewMost(current: Map<string, number>, previous: Map<string, number>): { name: string; delta: number } | null {
  let best: { name: string; delta: number } | null = null;
  const names = new Set([...current.keys(), ...previous.keys()]);
  for (const name of names) {
    const delta = (current.get(name) ?? 0) - (previous.get(name) ?? 0);
    if (delta <= 0) continue;
    if (!best || delta > best.delta) best = { name, delta };
  }
  return best;
}

export function weekWindow(todayIso: string): { start: string; end: string; prevStart: string; prevEnd: string } {
  const end = addDaysIso(todayIso, -1);
  const start = addDaysIso(end, -6);
  const prevEnd = addDaysIso(start, -1);
  const prevStart = addDaysIso(prevEnd, -6);
  return { start, end, prevStart, prevEnd };
}
