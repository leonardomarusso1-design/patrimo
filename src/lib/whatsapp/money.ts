import { round2 } from "./text";

/**
 * Lê um valor em real. Aceita 9,90 / 1.234,56 / 3.200 / 9.90 / R$ 10.
 * Não trata inteiro solto (isso fica com o parser, para não confundir com "dia 10").
 */
export function parseMoneyToken(raw: string): number | null {
  const t = raw.trim().replace(/^r\$\s*/i, "").replace(/\s/g, "");
  if (!t || !/\d/.test(t)) return null;
  let n: number;
  if (t.includes(",")) {
    n = Number(t.replace(/\./g, "").replace(",", "."));
  } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
    n = Number(t.replace(/\./g, ""));
  } else if (/^\d+\.\d{1,2}$/.test(t)) {
    n = Number(t);
  } else if (/^\d+$/.test(t)) {
    n = Number(t);
  } else {
    return null;
  }
  if (!Number.isFinite(n) || n <= 0 || n > 100_000_000) return null;
  return round2(n);
}

const MONEY_RE =
  /r\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d{1,3}(?:\.\d{3})+(?:,\d{2})?|\d+,\d{2}|\d+\.\d{2}/gi;

export function findMoney(text: string): { amount: number; start: number; end: number } | null {
  const matches = [...text.matchAll(MONEY_RE)];
  if (!matches.length) return null;
  const last = matches[matches.length - 1];
  const amount = parseMoneyToken(last[0]);
  if (amount == null || last.index == null) return null;
  return { amount, start: last.index, end: last.index + last[0].length };
}

/** Inteiro que sobrou depois de tirar dia, parcela e data. "salário 3200". */
export function findBareAmount(text: string): { amount: number; start: number; end: number } | null {
  const matches = [...text.matchAll(/\b\d{1,7}\b/g)];
  if (!matches.length) return null;
  const last = matches[matches.length - 1];
  const amount = parseMoneyToken(last[0]);
  if (amount == null || last.index == null) return null;
  return { amount, start: last.index, end: last.index + last[0].length };
}
