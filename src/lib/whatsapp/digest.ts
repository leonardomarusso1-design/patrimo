import { addDaysIso, zonedParts } from "./text";

type Parts = ReturnType<typeof zonedParts>;

export type DigestPrefs = {
  alerts: boolean;
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
};

/** 8h de Brasília. Semanal na segunda (semana que terminou). Mensal no dia 1. */
export function digestsDue(parts: Pick<Parts, "d" | "weekday">, prefs: DigestPrefs): Array<"daily" | "weekly" | "monthly"> {
  if (!prefs.alerts) return [];
  const out: Array<"daily" | "weekly" | "monthly"> = [];
  if (prefs.daily) out.push("daily");
  if (prefs.weekly && parts.weekday === "Mon") out.push("weekly");
  if (prefs.monthly && parts.d === 1) out.push("monthly");
  return out;
}

export function alreadySent(kind: "daily" | "weekly" | "monthly", todayIso: string, link: {
  last_daily_on: string | null;
  last_weekly_on: string | null;
  last_monthly_on: string | null;
}): boolean {
  const map = {
    daily: link.last_daily_on,
    weekly: link.last_weekly_on,
    monthly: link.last_monthly_on,
  };
  const value = map[kind];
  return Boolean(value && value.slice(0, 10) === todayIso);
}

export function dailyBillText(
  bills: { name: string; amount: number; due: string }[],
  format: (n: number) => string,
  todayIso: string,
): string | null {
  if (!bills.length) return null;
  const tomorrow = addDaysIso(todayIso, 1);
  return bills
    .slice(0, 6)
    .map((b) => {
      const when = b.due === todayIso ? "hoje" : b.due === tomorrow ? "amanha" : `${b.due.slice(8, 10)}/${b.due.slice(5, 7)}`;
      return `${b.name} ${format(b.amount)} (${when})`;
    })
    .join("; ");
}
