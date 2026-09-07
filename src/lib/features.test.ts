import { describe, it, expect } from "vitest";
import { buildAlerts } from "./alerts";
import { suggestCategory, suggestKind } from "./categorize";

describe("buildAlerts", () => {
  const base = {
    currency: "BRL",
    monthIncome: 5000,
    monthExpense: 3000,
    variable: 1000,
    reserveSaved: 0,
    reserveTarget: 0,
    goals: [],
  };

  it("mês no vermelho vira danger", () => {
    const a = buildAlerts({ ...base, monthExpense: 6000 });
    expect(a[0].level).toBe("danger");
    expect(a[0].href).toBe("/app/orcamento");
  });

  it("variável acima de 40% da renda vira warn", () => {
    const a = buildAlerts({ ...base, variable: 2500 });
    expect(a.some((x) => x.level === "warn" && x.text.includes("variável"))).toBe(true);
  });

  it("reserva abaixo de 30% alerta faltante", () => {
    const a = buildAlerts({ ...base, reserveSaved: 500, reserveTarget: 10000 });
    expect(a.some((x) => x.href === "/app/reserva")).toBe(true);
  });

  it("meta vencendo em <=90d com saldo faltante", () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const a = buildAlerts({
      ...base,
      goals: [{ name: "Carro", target: 20000, saved: 5000, deadline: d.toISOString().slice(0, 10) }],
    });
    expect(a.some((x) => x.text.includes("Carro"))).toBe(true);
  });

  it("meta sem prazo ou já batida não alerta", () => {
    const a = buildAlerts({
      ...base,
      goals: [
        { name: "A", target: 100, saved: 100, deadline: "2027-01-01" },
        { name: "B", target: 100, saved: 0, deadline: null },
      ],
    });
    expect(a.some((x) => x.text.includes('"A"') || x.text.includes('"B"'))).toBe(false);
  });
});

describe("categorize", () => {
  it("sugere categoria por palavra-chave", () => {
    expect(suggestCategory("PAG*IFOOD")).toBe("Alimentação");
    expect(suggestCategory("UBER *TRIP HELP.UBER.COM")).toBe("Transporte");
    expect(suggestCategory("NETFLIX.COM")).toBe("Assinaturas");
    expect(suggestCategory("Compra no supermercado ABC")).toBe("Mercado");
  });

  it("descrição desconhecida devolve null", () => {
    expect(suggestCategory("TED RECEBIDA JOAO")).toBeNull();
  });

  it("recorrentes viram expense_fixed", () => {
    expect(suggestKind("NETFLIX.COM")).toBe("expense_fixed");
    expect(suggestKind("ALUGUEL APTO 32")).toBe("expense_fixed");
    expect(suggestKind("PAG*IFOOD")).toBeNull();
  });
});
