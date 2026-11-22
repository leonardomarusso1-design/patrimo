import { findBareAmount, findMoney } from "./money";
import { addDaysIso, fold, titleCase } from "./text";

export type ParsedEntry = {
  amount: number;
  name: string;
  incomeHint: boolean;
  expenseHint: boolean;
  recurringHint: boolean;
  fixedHint: boolean;
  dueDay: number | null;
  entryDate: string;
  installments: number | null;
};

const INCOME =
  /\b(recebi|recebido|salario|salário|receita|freelance|rendimento|deposito|depósito|entrou)\b/i;
const EXPENSE = /\b(gastei|paguei|comprei|compra|pagamento|pago)\b/i;
const RECURRING =
  /\b(todo mes|todo mês|mensalidade|assinatura|aluguel|condominio|condomínio|iptu)\b/i;
const FIXED_WORD = /\b(fixo|fixa)\b/i;

const STOP = new Set([
  "paguei",
  "gastei",
  "comprei",
  "recebi",
  "compra",
  "pagamento",
  "pago",
  "de",
  "do",
  "da",
  "dos",
  "das",
  "no",
  "na",
  "nos",
  "nas",
  "em",
  "um",
  "uma",
  "o",
  "a",
  "os",
  "as",
  "pro",
  "pra",
  "para",
  "com",
  "por",
  "pix",
  "debito",
  "débito",
  "credito",
  "crédito",
  "cartao",
  "cartão",
  "dinheiro",
  "vista",
  "hoje",
  "ontem",
  "anteontem",
  "reais",
  "real",
  "rs",
  "r$",
  "todo",
  "mes",
  "mês",
  "dia",
  "vence",
  "vencimento",
]);

function cut(text: string, start: number, end: number): string {
  return `${text.slice(0, start)} ${text.slice(end)}`;
}

function parseDate(text: string, today: string): { iso: string; rest: string } {
  const iso = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) {
    return { iso: `${iso[1]}-${iso[2]}-${iso[3]}`, rest: text.replace(iso[0], " ") };
  }
  const br = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (br) {
    const d = Number(br[1]);
    const m = Number(br[2]);
    let y = br[3] ? Number(br[3]) : Number(today.slice(0, 4));
    if (y < 100) y += 2000;
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const found = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      return { iso: found, rest: text.replace(br[0], " ") };
    }
  }
  const f = fold(text);
  if (f.includes("anteontem")) return { iso: addDaysIso(today, -2), rest: text };
  if (f.includes("ontem")) return { iso: addDaysIso(today, -1), rest: text };
  return { iso: today, rest: text };
}

function cleanName(rest: string): string {
  const words = fold(rest)
    .split(" ")
    .filter((w) => w && !STOP.has(w) && !/^\d+([.,]\d+)?$/.test(w) && w !== "x");
  const name = titleCase(words.join(" "));
  return name || "Lançamento";
}

/**
 * Extrai um lançamento de uma frase. Devolve null se não houver valor.
 * `today` é a data civil de Brasília (YYYY-MM-DD), injetada para o teste ser estável.
 */
export function parseEntry(text: string, today: string): ParsedEntry | null {
  let rest = text.trim();
  if (!rest) return null;

  const inst = rest.match(/\b(?:em\s+)?(\d{1,2})\s*x\b/i) ?? rest.match(/\b(\d{1,2})\s+parcelas?\b/i);
  let installments: number | null = null;
  if (inst) {
    const n = Number(inst[1]);
    if (n >= 2 && n <= 48) installments = n;
    rest = rest.replace(inst[0], " ");
  }

  const due = rest.match(/\b(?:vence(?:\s+dia)?|vencimento|dia)\s+(\d{1,2})\b/i);
  let dueDay: number | null = null;
  if (due) {
    const n = Number(due[1]);
    if (n >= 1 && n <= 31) dueDay = n;
    rest = rest.replace(due[0], " ");
  }

  const dated = parseDate(rest, today);
  rest = dated.rest;

  const money = findMoney(rest) ?? findBareAmount(rest);
  if (!money) return null;
  rest = cut(rest, money.start, money.end);

  const folded = fold(text);
  return {
    amount: money.amount,
    name: cleanName(rest),
    incomeHint: INCOME.test(folded),
    expenseHint: EXPENSE.test(folded),
    recurringHint: RECURRING.test(folded),
    fixedHint: FIXED_WORD.test(folded) || RECURRING.test(folded),
    dueDay,
    entryDate: dated.iso,
    installments,
  };
}

/** Mensagem que é só o código gerado no painel. */
export function parseLinkCode(text: string): string | null {
  const m = text.trim().match(/^(?:ordre[-\s]?)?(\d{6})$/i);
  return m ? m[1] : null;
}
