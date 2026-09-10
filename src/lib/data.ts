import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import { hasActiveAccess } from "@/lib/plans";

// cache() dedupa por request: layout + page chamam requireUser/getProfile sem
// repetir a ida ao Supabase Auth / à tabela profiles.
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { user, supabase };
});

export const getProfile = cache(async (): Promise<Tables<"profiles">> => {
  const { user, supabase } = await requireUser();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (!data) {
    // fallback: trigger ainda não rodou / conta antiga
    const { data: created } = await supabase
      .from("profiles")
      .upsert({ id: user.id, email: user.email ?? "" })
      .select("*")
      .maybeSingle();
    if (created) return created;

    return {
      id: user.id,
      email: user.email ?? "",
      full_name: user.user_metadata?.full_name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      display_currency: "BRL",
      income_band: null,
      occupation: null,
      country: "BR",
      state: null,
      city: null,
      onboarding_completed: false,
      plan: "free",
      plan_expires_at: null,
      marketing_opt_in: false,
      investor_profile: null,
      investor_profile_at: null,
      renewal_reminded_at: null,
      theme: "system",
      dashboard_cards: ["reserva", "metas"],
      invest_pct: 10,
      trial_started_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Tables<"profiles">;
  }
  return data;
});

/** Garante que o onboarding foi feito antes de entrar no app. */
export async function requireOnboarded() {
  const profile = await getProfile();
  if (!profile.onboarding_completed) redirect("/onboarding");
  return profile;
}

/**
 * Hard paywall: sem assinatura ativa, o painel não abre.
 * Chamado no layout de /app. Deixa passar quem já pagou.
 */
export async function requirePaidAccess() {
  const { supabase } = await requireUser();
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    redirect("/mfa");
  }

  const profile = await getProfile();
  if (!profile.onboarding_completed) redirect("/onboarding");
  if (!hasActiveAccess(profile)) redirect("/ativar");
  return profile;
}

/** Compatibilidade: com plano único, o gate de feature é o mesmo do paywall. */
export async function requirePlan(required?: string, feature?: string) {
  void required;
  void feature;
  return requirePaidAccess();
}

/**
 * Como requireUser(), mas também exige assinatura ativa + AAL2. Usar em toda
 * Server Action de escrita/custo — o layout não roda para POSTs de action.
 */
export async function requirePaidUser() {
  await requirePaidAccess();
  return requireUser();
}

export function currentReferenceMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
