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
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!data) {
    // fallback: trigger ainda não rodou / conta antiga
    const { data: created } = await supabase
      .from("profiles")
      .upsert({ id: user.id, email: user.email ?? "" })
      .select("*")
      .single();
    return created as Tables<"profiles">;
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

export function currentReferenceMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
