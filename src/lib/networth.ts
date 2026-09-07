import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getRates, convert } from "@/lib/fx";

type SB = SupabaseClient<Database>;

export type NetWorth = {
  netWorth: number;
  assets: number; // bens (valor de mercado − financiamento vinculado)
  wallet: number; // investimentos
  reserve: number; // reserva de emergência
  debts: number; // dívidas não vinculadas a bens
};

/**
 * Patrimônio líquido do usuário na moeda de exibição.
 * bens = valor de mercado − saldo do financiamento vinculado.
 * Fonte única da conta — usado no dashboard, no snapshot mensal e na Visão geral.
 */
export async function computeNetWorth(
  sb: SB,
  userId: string,
  displayCurrency: string,
): Promise<NetWorth> {
  const [rates, reservesRes, investRes, itemsRes, debtsRes] = await Promise.all([
    getRates(),
    sb.from("emergency_reserves").select("amount").eq("user_id", userId),
    sb.from("investments").select("current_amount, currency").eq("user_id", userId),
    sb
      .from("patrimony_items")
      .select("value, appraised_value, currency, linked_debt_id")
      .eq("user_id", userId),
    sb.from("debts").select("id, remaining_amount").eq("user_id", userId),
  ]);

  const cv = (n: number, cur: string | null) =>
    convert(Number(n), cur ?? "BRL", displayCurrency, rates);

  const reserve = (reservesRes.data ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const wallet = (investRes.data ?? []).reduce(
    (s, r) => s + cv(r.current_amount, r.currency),
    0,
  );

  const debtBal = new Map(
    (debtsRes.data ?? []).map((d) => [d.id, Number(d.remaining_amount)]),
  );
  const assets = (itemsRes.data ?? []).reduce((s, it) => {
    const mv = cv(it.appraised_value ?? it.value, it.currency);
    const linked = it.linked_debt_id ? (debtBal.get(it.linked_debt_id) ?? 0) : 0;
    return s + (mv - linked);
  }, 0);

  const linkedIds = new Set(
    (itemsRes.data ?? [])
      .map((i) => i.linked_debt_id)
      .filter((v): v is string => !!v),
  );
  const debts = (debtsRes.data ?? [])
    .filter((d) => !linkedIds.has(d.id))
    .reduce((s, d) => s + Number(d.remaining_amount), 0);

  return { netWorth: assets + wallet + reserve - debts, assets, wallet, reserve, debts };
}
