import { describe, it, expect } from "vitest";
import { buildCashflow } from "./cashflow";

const today = new Date("2026-09-15T12:00:00");

function e(over: Partial<Parameters<typeof buildCashflow>[0][number]>) {
  return {
    name: "x",
    amount: 100,
    kind: "expense_variable" as const,
    entry_date: null,
    reference_month: "2026-09-01",
    pending: false,
    recurring: false,
    due_day: null,
    ...over,
  };
}

describe("buildCashflow", () => {
  it("realizado = confirmado nos últimos N dias", () => {
    const r = buildCashflow([e({ entry_date: "2026-09-10", kind: "income", amount: 500 })], 30, today);
    expect(r).toHaveLength(1);
    expect(r[0].status).toBe("realizado");
    expect(r[0].amount).toBe(500);
  });

  it("previsto = lançamento pending com data futura", () => {
    const r = buildCashflow([e({ entry_date: "2026-09-20", pending: true, amount: 80 })], 30, today);
    expect(r[0].status).toBe("previsto");
    expect(r[0].amount).toBe(-80);
  });

  it("previsto ignora pending com data passada", () => {
    const r = buildCashflow([e({ entry_date: "2026-09-01", pending: true })], 30, today);
    expect(r).toHaveLength(0);
  });

  it("projeta recorrência pro próximo mês, não duplica mês já lançado", () => {
    const rows = [
      e({ name: "Aluguel", kind: "expense_fixed", amount: 1500, recurring: true, due_day: 5, reference_month: "2026-09-01" }),
    ];
    const r = buildCashflow(rows, 60, today); // janela até ~14/nov
    const proj = r.filter((i) => i.source === "recorrencia" && i.name === "Aluguel");
    // set. já lançado (não projeta), out. e talvez nov. projetados
    expect(proj.map((p) => p.date)).toContain("2026-10-05");
    expect(proj.every((p) => p.amount === -1500)).toBe(true);
  });
});
