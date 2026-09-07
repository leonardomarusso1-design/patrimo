import { describe, it, expect } from "vitest";
import {
  futureValue,
  requiredMonthlyContribution,
  emergencyTarget,
  fireNumber,
  fiftyThirtyTwenty,
  debtPayoffMonths,
  simpleInterest,
  cdiReturn,
  irRateFixedIncome,
  percentOf,
  whatPercent,
  percentChange,
} from "./finance";

describe("finance", () => {
  it("futureValue: juros compostos com aportes", () => {
    const r = futureValue({ initial: 1000, monthlyContribution: 500, annualRatePct: 12, years: 10 });
    expect(r.contributed).toBe(1000 + 500 * 120);
    expect(r.total).toBeGreaterThan(r.contributed);
    expect(Math.round(r.interest)).toBe(Math.round(r.total - r.contributed));
  });

  it("futureValue: taxa zero = só a soma dos aportes", () => {
    const r = futureValue({ initial: 100, monthlyContribution: 100, annualRatePct: 0, years: 1 });
    expect(Math.round(r.total)).toBe(1300);
    expect(r.interest).toBeCloseTo(0);
  });

  it("requiredMonthlyContribution: sem juros", () => {
    const v = requiredMonthlyContribution({ target: 12000, current: 0, annualRatePct: 0, months: 12 });
    expect(v).toBe(1000);
  });

  it("emergencyTarget: básico 6x, blindado 12x", () => {
    expect(emergencyTarget(1000, "basic")).toBe(6000);
    expect(emergencyTarget(1000, "shield")).toBe(12000);
  });

  it("fireNumber: regra dos 4%", () => {
    expect(fireNumber(10000, 4)).toBe(3_000_000);
  });

  it("fiftyThirtyTwenty", () => {
    expect(fiftyThirtyTwenty(1000)).toEqual({ needs: 500, wants: 300, savings: 200 });
  });

  it("debtPayoffMonths: pagamento não cobre juros -> null", () => {
    expect(debtPayoffMonths({ balance: 10000, monthlyInterestPct: 10, monthlyPayment: 100 })).toBeNull();
  });

  it("debtPayoffMonths: quita em número finito de meses", () => {
    const m = debtPayoffMonths({ balance: 5000, monthlyInterestPct: 2, monthlyPayment: 600 });
    expect(m).not.toBeNull();
    expect(m!).toBeGreaterThan(8);
    expect(m!).toBeLessThan(12);
  });

  it("simpleInterest: juros lineares sobre o principal", () => {
    const r = simpleInterest({ principal: 1000, annualRatePct: 10, years: 5 });
    expect(r.interest).toBe(500);
    expect(r.total).toBe(1500);
  });

  it("irRateFixedIncome: tabela regressiva", () => {
    expect(irRateFixedIncome(90)).toBe(22.5);
    expect(irRateFixedIncome(200)).toBe(20);
    expect(irRateFixedIncome(400)).toBe(17.5);
    expect(irRateFixedIncome(800)).toBe(15);
  });

  it("cdiReturn: isento não desconta IR e rende mais que tributável", () => {
    const base = { principal: 10000, cdiPct: 100, annualCdiPct: 10.65, months: 12 };
    const trib = cdiReturn(base);
    const isento = cdiReturn({ ...base, taxExempt: true });
    expect(trib.tax).toBeGreaterThan(0);
    expect(isento.tax).toBe(0);
    expect(isento.net).toBeGreaterThan(trib.net);
    expect(trib.grossInterest).toBeCloseTo(isento.grossInterest, 2);
  });

  it("porcentagem: três operações", () => {
    expect(percentOf(240, 15)).toBe(36);
    expect(whatPercent(45, 180)).toBe(25);
    expect(percentChange(80, 95)).toBeCloseTo(18.75);
    expect(percentChange(200, 150)).toBe(-25);
  });
});
