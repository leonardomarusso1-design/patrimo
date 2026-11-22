import type { BudgetKind } from "@/types/database";
import { buildDraft, type EntryDraft, type UserRule } from "./classify";
import { detectIntent, interpretButton, type Intent, type ReportQuery } from "./intent";
import { parseEntry, parseLinkCode } from "./parse";

export type InterpretContext = {
  today: string;
  linked: boolean;
  hasPending: boolean;
  rules: UserRule[];
  categories: { name: string; kind: BudgetKind }[];
  accounts?: { id: string; name: string }[];
  cards?: { id: string; name: string }[];
};

export type Interpretation =
  | { type: "link"; code: string }
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
  | { type: "invest"; question: string }
  | { type: "entry"; draft: EntryDraft }
  | { type: "unknown" };

function fromIntent(intent: Intent, text: string, ctx: InterpretContext): Interpretation {
  switch (intent.type) {
    case "entry": {
      const parsed = parseEntry(text, ctx.today);
      if (!parsed) return { type: "unknown" };
      return {
        type: "entry",
        draft: buildDraft(parsed, text, ctx.rules, ctx.categories, ctx.accounts ?? [], ctx.cards ?? []),
      };
    }
    case "invest":
      return { type: "invest", question: text };
    case "report":
      return { type: "report", query: intent.query };
    case "correct_amount":
    case "correct_kind":
    case "correct_category":
    case "paid":
      return intent;
    default:
      return { type: intent.type };
  }
}

export function interpretText(text: string, ctx: InterpretContext): Interpretation {
  const code = parseLinkCode(text);
  if (code && !ctx.linked) return { type: "link", code };

  const intent = detectIntent(text, ctx.today, ctx.hasPending);
  if (ctx.hasPending && intent.type === "entry") {
    const asCategory = text.trim();
    if (asCategory.length >= 2 && asCategory.length <= 40 && !parseEntry(text, ctx.today)) {
      return { type: "correct_category", category: asCategory };
    }
  }
  return fromIntent(intent, text, ctx);
}

export function interpretTap(id: string): Interpretation | null {
  if (id.startsWith("cat:")) {
    const category = id.slice(4).trim();
    if (!category) return null;
    return { type: "correct_category", category: category.slice(0, 60) };
  }
  const intent = interpretButton(id);
  if (!intent) return null;
  return fromIntent(intent, "", { today: "", linked: true, hasPending: true, rules: [], categories: [] });
}
