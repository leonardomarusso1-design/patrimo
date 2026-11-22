import { suggestCategory, suggestKind } from "@/lib/categorize";
import type { BudgetKind } from "@/types/database";
import { AUTO_SAVE_CONFIDENCE } from "./config";
import type { ParsedEntry } from "./parse";
import { fold } from "./text";

export type UserRule = {
  pattern: string;
  category: string;
  kind: BudgetKind | null;
};

export type Named = { id: string; name: string };

export type EntryDraft = {
  kind: BudgetKind;
  name: string;
  category: string | null;
  amount: number;
  entryDate: string;
  recurring: boolean;
  dueDay: number | null;
  installmentsTotal: number | null;
  confidence: number;
  rulePattern: string | null;
  accountId: string | null;
  cardId: string | null;
  requireConfirm: boolean;
  categoryUnlisted: boolean;
};

const RECURRING_STRONG = ["todo mes", "mensalidade", "assinatura", "aluguel", "condominio", "iptu"];

function matchName(list: Named[], text: string): string | null {
  const f = fold(text);
  const hits = list.filter((item) => {
    const n = fold(item.name);
    return n.length >= 3 && f.includes(n);
  });
  if (hits.length !== 1) return null;
  return hits[0].id;
}

export function matchCategoryName(categories: { name: string }[], suggestion: string | null): string | null {
  if (!suggestion) return null;
  const want = fold(suggestion);
  const exact = categories.find((c) => fold(c.name) === want);
  if (exact) return exact.name;
  const loose = categories.filter((c) => {
    const n = fold(c.name);
    return n.length >= 4 && (n.includes(want) || want.includes(n));
  });
  return loose.length === 1 ? loose[0].name : null;
}

export function buildDraft(
  parsed: ParsedEntry,
  sourceText: string,
  rules: UserRule[],
  categories: { name: string; kind: BudgetKind }[],
  accounts: Named[] = [],
  cards: Named[] = [],
): EntryDraft {
  const folded = fold(`${parsed.name} ${sourceText}`);
  const rule = rules.find((r) => {
    const p = fold(r.pattern);
    return p.length >= 3 && (folded.includes(p) || fold(parsed.name) === p);
  });

  let kind: BudgetKind;
  let category: string | null = null;
  let confidence = 0.55;
  let fromRule = false;

  if (rule) {
    fromRule = true;
    category = rule.category;
    kind = rule.kind ?? (parsed.incomeHint ? "income" : suggestKind(folded) ?? "expense_variable");
    confidence = 0.95;
  } else if (parsed.incomeHint && !parsed.expenseHint) {
    kind = "income";
    const salary = /\b(salario|salário)\b/i.test(folded);
    category = matchCategoryName(categories, salary ? "Salário" : "Receita") ??
      (categories.length === 0 ? (salary ? "Salário" : "Receita") : null);
    confidence = category ? 0.9 : 0.7;
  } else {
    const hinted = suggestKind(folded);
    kind = parsed.fixedHint || hinted === "expense_fixed" ? "expense_fixed" : "expense_variable";
    const suggested = suggestCategory(`${parsed.name} ${sourceText}`);
    const matched = matchCategoryName(categories, suggested);
    if (matched) {
      category = matched;
      confidence = 0.9;
    } else if (suggested && categories.length === 0) {
      category = suggested;
      confidence = 0.88;
    } else if (suggested) {
      category = suggested;
      confidence = 0.6;
    } else if (categories.length === 0) {
      category = "Outros";
      confidence = 0.62;
    }
  }

  const recurring =
    parsed.recurringHint || RECURRING_STRONG.some((w) => folded.includes(w));
  if (recurring && kind !== "income") kind = "expense_fixed";

  let accountId = matchName(accounts, sourceText);
  let cardId = matchName(cards, sourceText);
  if (accountId && cardId) {
    if (/\b(cartao|credito)\b/.test(folded)) accountId = null;
    else cardId = null;
  }

  const categoryUnlisted = Boolean(
    category && categories.length > 0 && !matchCategoryName(categories, category),
  );
  if (categoryUnlisted && !fromRule) confidence = Math.min(confidence, 0.6);

  const requireConfirm = confidence < AUTO_SAVE_CONFIDENCE || (categoryUnlisted && !fromRule);

  return {
    kind,
    name: parsed.name,
    category,
    amount: parsed.amount,
    entryDate: parsed.entryDate,
    recurring: kind === "income" ? parsed.recurringHint : recurring,
    dueDay: parsed.dueDay,
    installmentsTotal: parsed.installments,
    confidence,
    rulePattern: fold(parsed.name).slice(0, 60) || null,
    accountId,
    cardId,
    requireConfirm,
    categoryUnlisted,
  };
}
