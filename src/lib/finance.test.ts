import { describe, it, expect } from "vitest";
import {
  futureValue,
  requiredMonthlyContribution,
  emergencyTarget,
  fireNumber,
  fiftyThirtyTwenty,
  debtPayoffMonths,
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
});
