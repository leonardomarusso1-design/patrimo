import type { BudgetKind } from "@/types/database";
import { parseMoneyToken } from "./money";
import { fold, monthMentioned } from "./text";

export type ReportTopic = "spent" | "income" | "balance" | "reserve" | "bills" | "category" | "networth";

export type ReportQuery = {
  topic: ReportTopic;
  month: string | null;
  filter: string | null;
};

export type Intent =
  | { type: "help" }
  | { type: "stop" }
  | { type: "undo" }
  | { type: "confirm" }
  | { type: "cancel" }
  | { type: "fix_prompt" }
  | { type: "correct_amount"; amount: number }
  | { type: "correct_kind"; kind: BudgetKind }
  | { type: "correct_category"; category: string }
  | { type: "paid"; query: string }
  | { type: "report"; query: ReportQuery }
  | { type: "invest" }
  | { type: "entry" }
  | { type: "unknown" };

const INVEST =
  /\b(selic|cdi|ipca|inflacao|inflação|tesouro|cdb|lci|lca|fii|fiis|etf|acao|ação|acoes|ações|fgc|carteira|investir|investimento|renda fixa|renda variavel|renda variável|juros compostos|regra dos 4|perfil de invest)\b/i;

const TICKER = /\b[a-z]{4}\d{1,2}\b/i;

function reportQuery(text: string, today: string): ReportQuery {
  const f = fold(text);
  const month = monthMentioned(text, today);
  const withFilter = text.match(/\bcom\s+([A-Za-zÀ-ÿ0-9][\wÀ-ÿ'-]{1,30})/i);
  const filter = withFilter ? withFilter[1].trim() : null;
  if (/\b(reserva)\b/.test(f)) return { topic: "reserve", month, filter: null };
  if (/\b(conta|contas|vencer|vence|pagar essa semana|a pagar)\b/.test(f) && !/\b(quanto gastei|quanto recebi)\b/.test(f)) {
    return { topic: "bills", month, filter: null };
  }
  if (/\b(patrimonio|patrimônio)\b/.test(f)) return { topic: "networth", month, filter: null };
  if (/\b(quanto recebi|receitas?)\b/.test(f)) return { topic: "income", month, filter: filter || null };
  if (filter && filter.length >= 2 && /\b(quanto gastei|gastei com|gastos com)\b/.test(f)) {
    return { topic: "category", month, filter };
  }
  if (/\b(quanto gastei|gastos|despesas)\b/.test(f)) return { topic: "spent", month, filter: null };
  return { topic: "balance", month, filter: null };
}

export function detectIntent(text: string, today: string, hasPending: boolean): Intent {
  const raw = text.trim();
  const f = fold(raw);
  if (!f) return { type: "unknown" };

  if (/^(parar|pare|stop|cancelar avisos|nao quero avisos|não quero avisos)$/.test(f)) {
    return { type: "stop" };
  }
  if (/^(ajuda|menu|oi|ola|olá|comecar|começar|help|\?)$/.test(f)) return { type: "help" };
  if (/^(desfazer|apagar|apagar o ultimo|apagar o último|cancelar ultimo|cancelar o ultimo)$/.test(f)) {
    return { type: "undo" };
  }
  if (/^(sim|confirmar|confirma|pode|pode anotar|ok|isso|isso mesmo)$/.test(f)) {
    return hasPending ? { type: "confirm" } : { type: "help" };
  }
  if (/^(nao|não|cancelar|cancela|deixa|deixa pra la|deixa pra lá)$/.test(f)) {
    return hasPending ? { type: "cancel" } : { type: "unknown" };
  }
  if (/^(corrigir|corrige)$/.test(f)) return { type: "fix_prompt" };

  const amountFix =
    raw.match(/na verdade (?:foi|era|é|e)\s*(?:r\$\s*)?([\d.,]+)/i) ??
    raw.match(/^(?:foi|era|valor)\s+(?:r\$\s*)?([\d.,]+)$/i);
  if (amountFix) {
    const n = parseMoneyToken(amountFix[1]);
    if (n) return { type: "correct_amount", amount: n };
  }

  const kindFix = f.match(/\b(?:isso e|isso é|e|é|era|fica|tipo)\s+(fixo|fixa|variavel|variável|receita)\b/);
  if (kindFix && !findLooseAmount(raw)) {
    const k = kindFix[1];
    const kind: BudgetKind =
      k.startsWith("receita") ? "income" : k.startsWith("fix") ? "expense_fixed" : "expense_variable";
    return { type: "correct_kind", kind };
  }

  const catFix = raw.match(/^(?:categoria|muda(?:r)?(?: a)? categoria(?: para)?|era a categoria)\s+(.+)$/i);
  if (catFix) return { type: "correct_category", category: catFix[1].trim().slice(0, 60) };

  if (hasPending && /^(?:era|e|é)\s+(.+)$/i.test(raw) && !findLooseAmount(raw)) {
    const name = raw.replace(/^(?:era|e|é)\s+/i, "").trim();
    if (name.length >= 2 && name.length <= 40) return { type: "correct_category", category: name };
  }

  const ticker = TICKER.test(raw);
  const loggedMovement = /\b(gastei|paguei|comprei|recebi|salario)\b/.test(f) && findLooseAmount(raw);
  if ((INVEST.test(raw) || (ticker && /\b(compr|vend|vale|devo|caiu|subiu|entro|saio)\b/.test(f))) && !(loggedMovement && !ticker)) {
    return { type: "invest" };
  }

  if (
    /^(quanto |resumo|relatorio|relatório|tenho conta|contas a pagar|contas pra pagar|quanto falta)/i.test(
      raw.trim(),
    ) ||
    /\b(quanto gastei|quanto recebi|quanto falta da reserva|patrimonio liquido|patrimônio líquido)\b/i.test(raw)
  ) {
    return { type: "report", query: reportQuery(raw, today) };
  }

  if (/^paguei\b/i.test(raw) && !findLooseAmount(raw)) {
    const q = raw.replace(/^paguei\s+(?:o |a |os |as )?/i, "").trim();
    if (q) return { type: "paid", query: q.slice(0, 80) };
  }

  return { type: "entry" };
}

function findLooseAmount(text: string): boolean {
  return /(?:r\$\s*)?\d{1,3}(?:\.\d{3})+(?:,\d{2})?|(?:r\$\s*)?\d+,\d{2}|(?:r\$\s*)?\d+\.\d{2}|\b\d{2,7}\b/.test(
    text,
  );
}

export function interpretButton(id: string): Intent | null {
  if (id === "confirm" || id === "confirm_cat") return { type: "confirm" };
  if (id === "cancel") return { type: "cancel" };
  if (id === "undo") return { type: "undo" };
  if (id === "fix") return { type: "fix_prompt" };
  return null;
}
