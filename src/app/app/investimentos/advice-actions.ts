"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requirePaidAccess } from "@/lib/data";
import { checkRateLimit, ipFromHeaders } from "@/lib/rate-limit";
import { safeError } from "@/lib/logger";
import { requireUser } from "@/lib/data";
import { buildAndStoreAdvice } from "@/lib/advice";

export type AdviceState = { error?: string; ok?: boolean };

export async function requestAdvice(): Promise<AdviceState> {
  const profile = await requirePaidAccess();
  if (!profile.investor_profile) {
    return { error: "Responda o perfil de investidor primeiro." };
  }

  const ip = ipFromHeaders(await headers());
  const rl = await checkRateLimit("ai", `${profile.id}:${ip}`);
  if (!rl.ok) return { error: "Você já gerou uma análise há pouco. Tente mais tarde." };

  try {
    const { user, supabase } = await requireUser();
    const r = await buildAndStoreAdvice(
      user.id,
      profile.investor_profile,
      profile.display_currency,
      supabase,
    );
    if (!r.inserted) return { error: safeError("advice.insert", new Error("insert failed")) };
    revalidatePath("/app/investimentos");
    return { ok: true };
  } catch (err) {
    return { error: safeError("advice.request", err) };
  }
}
