import { describe, it, expect } from "vitest";
import { parseBRNumber, parseExtratoCsv } from "./csv";
import { convert } from "./fx";
import { scoreToProfile, MAX_SCORE } from "./investor";
import { hasActiveAccess, planAllows } from "./plans";

describe("csv", () => {
  it("parseBRNumber: formatos brasileiros e sinais", () => {
    expect(parseBRNumber("1.234,56")).toBe(1234.56);
    expect(parseBRNumber("-89,90")).toBe(-89.9);
    expect(parseBRNumber("R$ 100,00")).toBe(100);
    expect(parseBRNumber("(50,00)")).toBe(-50);
    expect(parseBRNumber("1234.56")).toBe(1234.56);
    expect(parseBRNumber("")).toBeNull();
  });

  it("parseExtratoCsv: com cabeçalho e separador ;", () => {
    const csv = "Data;Descrição;Valor\n01/09/2026;Mercado;-123,45\n05/09/2026;Salário;4000,00";
    const rows = parseExtratoCsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ date: "2026-09-01", description: "Mercado", amount: -123.45 });
    expect(rows[1].amount).toBe(4000);
  });

  it("parseExtratoCsv: ignora linhas com valor zero/vazio", () => {
    const csv = "data,desc,valor\n01/01/2026,Nada,0\n02/01/2026,Algo,10,00";
    expect(parseExtratoCsv(csv)).toHaveLength(1);
  });
});

describe("fx.convert", () => {
  const rates = { USD: 0.2, EUR: 0.18 }; // 1 BRL = 0.2 USD

  it("mesma moeda não converte", () => {
    expect(convert(100, "BRL", "BRL", rates)).toBe(100);
  });
  it("BRL -> USD", () => {
    expect(convert(100, "BRL", "USD", rates)).toBeCloseTo(20);
  });
  it("USD -> BRL", () => {
    expect(convert(20, "USD", "BRL", rates)).toBeCloseTo(100);
  });
  it("sem taxa disponível: retorna original", () => {
    expect(convert(100, "JPY", "BRL", rates)).toBe(100);
  });
});

describe("investor.scoreToProfile", () => {
  it("extremos e meio", () => {
    expect(scoreToProfile(0)).toBe("conservador");
    expect(scoreToProfile(MAX_SCORE)).toBe("arrojado");
    expect(scoreToProfile(Math.floor(MAX_SCORE / 2))).toBe("moderado");
  });
});

describe("plans", () => {
  it("hasActiveAccess: free = sem acesso", () => {
    expect(hasActiveAccess({ plan: "free", plan_expires_at: null })).toBe(false);
  });
  it("hasActiveAccess: pro com validade futura = acesso", () => {
    expect(
      hasActiveAccess({ plan: "pro", plan_expires_at: "2099-01-01T00:00:00Z" }),
    ).toBe(true);
  });
  it("hasActiveAccess: pro expirado = sem acesso", () => {
    expect(
      hasActiveAccess({ plan: "pro", plan_expires_at: "2000-01-01T00:00:00Z" }),
    ).toBe(false);
  });
  it("planAllows: qualquer pago libera", () => {
    expect(planAllows("pro", "elite")).toBe(true);
    expect(planAllows("free", "essential")).toBe(false);
  });
});
