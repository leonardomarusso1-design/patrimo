import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables, PlanId } from "@/types/database";
import { planAllows } from "@/lib/plans";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { user, supabase };
}

export async function getProfile(): Promise<Tables<"profiles">> {
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
}

/** Garante que o onboarding foi feito antes de entrar no app. */
export async function requireOnboarded() {
  const profile = await getProfile();
  if (!profile.onboarding_completed) redirect("/onboarding");
  return profile;
}

/** Bloqueia uma feature por plano — manda pra /sem-acesso se faltar. */
export async function requirePlan(required: PlanId, feature: string) {
  const profile = await getProfile();
  if (!planAllows(profile.plan, required)) {
    redirect(`/sem-acesso?f=${encodeURIComponent(feature)}&need=${required}`);
  }
  return profile;
}

export function currentReferenceMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
