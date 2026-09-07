import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, InvestorProfile } from "@/types/database";
import { generateAdvice } from "@/lib/ai";
import { CLASS_LABELS, VARIABLE_CLASSES } from "@/lib/investor";
import { getRates, convert } from "@/lib/fx";

type SB = SupabaseClient<Database>;

/**
 * Monta a foto da carteira do usuário, gera a análise e grava em
 * investment_advice. Usado pela ação sob demanda e pelo cron diário.
 */
export async function buildAndStoreAdvice(
  userId: string,
  profile: InvestorProfile,
  displayCurrency: string,
  sb: SB,
): Promise<{ inserted: boolean }> {
  const [{ data: inv }, rates] = await Promise.all([
    sb.from("investments").select("*").eq("user_id", userId),
    getRates(),
  ]);
  const rows = inv ?? [];
  const cv = (n: number, cur: string) => convert(Number(n), cur, displayCurrency, rates);

  const total = rows.reduce((s, r) => s + cv(r.current_amount, r.currency), 0);
  const variable = rows
    .filter((r) => VARIABLE_CLASSES.has(r.asset_class))
    .reduce((s, r) => s + cv(r.current_amount, r.currency), 0);

  const byClassMap = new Map<string, number>();
  for (const r of rows) {
    const label = CLASS_LABELS[r.asset_class] ?? r.asset_class;
    byClassMap.set(label, (byClassMap.get(label) ?? 0) + cv(r.current_amount, r.currency));
  }

  const advice = await generateAdvice({
    profile,
    currency: displayCurrency,
    total,
    variablePct: total > 0 ? (variable / total) * 100 : 0,
    byClass: [...byClassMap.entries()].map(([name, value]) => ({ name, value: Math.round(value) })),
  });

  const { error } = await sb.from("investment_advice").insert({
    user_id: userId,
    summary: advice.summary,
    actions: advice.actions,
    model: advice.model,
  });
  return { inserted: !error };
}
