"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireUser, getProfile } from "@/lib/data";
import { checkRateLimit } from "@/lib/rate-limit";
import { safeError } from "@/lib/logger";
import { generateAdvice } from "@/lib/ai";
import { CLASS_LABELS, VARIABLE_CLASSES } from "@/lib/investor";
import { getRates, convert } from "@/lib/fx";

export type AdviceState = { error?: string; ok?: boolean };

export async function requestAdvice(): Promise<AdviceState> {
  const profile = await getProfile();
  if (!profile.investor_profile) return { error: "Responda o perfil de investidor primeiro." };

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "0";
  const rl = await checkRateLimit("ai", `${profile.id}:${ip}`);
  if (!rl.ok) return { error: "Você já gerou uma análise há pouco. Tente mais tarde." };

  try {
    const { user, supabase } = await requireUser();
    const [{ data: inv }, rates] = await Promise.all([
      supabase.from("investments").select("*").eq("user_id", user.id),
      getRates(),
    ]);
    const rows = inv ?? [];
    const cur = profile.display_currency;
    const total = rows.reduce(
      (s, r) => s + convert(Number(r.current_amount), r.currency, cur, rates),
      0,
    );
    const variable = rows
      .filter((r) => VARIABLE_CLASSES.has(r.asset_class))
      .reduce((s, r) => s + convert(Number(r.current_amount), r.currency, cur, rates), 0);
    const byClassMap = new Map<string, number>();
    for (const r of rows) {
      const v = convert(Number(r.current_amount), r.currency, cur, rates);
      byClassMap.set(CLASS_LABELS[r.asset_class] ?? r.asset_class, (byClassMap.get(CLASS_LABELS[r.asset_class] ?? r.asset_class) ?? 0) + v);
    }

    const advice = await generateAdvice({
      profile: profile.investor_profile,
      currency: cur,
      total,
      variablePct: total > 0 ? (variable / total) * 100 : 0,
      byClass: [...byClassMap.entries()].map(([name, value]) => ({ name, value: Math.round(value) })),
    });

    const { error } = await supabase.from("investment_advice").insert({
      user_id: user.id,
      summary: advice.summary,
      actions: advice.actions,
      model: advice.model,
    });
    if (error) return { error: safeError("advice.insert", error) };

    revalidatePath("/app/investimentos");
    return { ok: true };
  } catch (err) {
    return { error: safeError("advice.request", err) };
  }
}
