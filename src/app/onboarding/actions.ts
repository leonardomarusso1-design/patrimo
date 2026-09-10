"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/data";
import { safeError } from "@/lib/logger";
import { sendEmail, welcomeEmail } from "@/lib/email";
import { CURRENCIES, INCOME_BANDS, OCCUPATIONS } from "@/lib/onboarding";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  display_currency: z.enum(CURRENCIES.map((c) => c.code) as [string, ...string[]]),
  income_band: z.enum(INCOME_BANDS as unknown as [string, ...string[]]),
  occupation: z.enum(OCCUPATIONS as unknown as [string, ...string[]]),
  country: z.string().trim().min(2).max(60),
  state: z.string().trim().max(60).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  terms: z.literal("on"),
  marketing_opt_in: z.string().optional(),
});

export type OnboardingState = { error?: string };

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Preencha todos os passos para continuar." };
  }
  const d = parsed.data;

  try {
    const { user, supabase } = await requireUser();
    const admin = createAdminClient();
    const { data: current } = await admin
      .from("profiles")
      .select("plan, plan_expires_at, trial_started_at")
      .eq("id", user.id)
      .maybeSingle();
    const startTrial = !current || (current.plan === "free" && !current.trial_started_at);
    const trialStartedAt = new Date().toISOString();
    const trialExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: saved, error } = await admin
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email ?? "",
        display_currency: d.display_currency,
        income_band: d.income_band,
        occupation: d.occupation,
        country: d.country,
        state: d.state || null,
        city: d.city || null,
        marketing_opt_in: d.marketing_opt_in === "on",
        onboarding_completed: true,
        ...(startTrial
          ? { plan: "pro" as const, plan_expires_at: trialExpiresAt, trial_started_at: trialStartedAt }
          : {}),
      }, { onConflict: "id" })
      .select("id, onboarding_completed")
      .single();
    if (error || !saved?.onboarding_completed) {
      return { error: safeError("onboarding.complete", error ?? new Error("Perfil não foi salvo")) };
    }

    if (user.email) {
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      try {
        await sendEmail(
          welcomeEmail(user.email, (p?.full_name ?? "").split(" ")[0] || "tudo pronto"),
        );
      } catch {
        // O e-mail de boas-vindas não pode bloquear a entrada no produto.
      }
    }
  } catch (err) {
    return { error: safeError("onboarding.complete", err) };
  }

  redirect("/app");
}
