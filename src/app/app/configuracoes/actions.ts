"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/data";
import { safeError } from "@/lib/logger";
import { CURRENCIES } from "@/lib/onboarding";

const schema = z.object({
  full_name: z.string().trim().min(2).max(80),
  display_currency: z.enum(CURRENCIES.map((c) => c.code) as [string, ...string[]]),
  occupation: z.string().trim().max(60).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  state: z.string().trim().max(60).optional().nullable(),
  marketing_opt_in: z.string().optional(),
});

export type SettingsState = { error?: string; ok?: boolean };

export async function setTheme(theme: "system" | "light" | "dark") {
  if (!["system", "light", "dark"].includes(theme)) return;
  try {
    const { user, supabase } = await requireUser();
    await supabase.from("profiles").update({ theme }).eq("id", user.id);
  } catch (err) {
    safeError("settings.theme", err);
  }
}

export async function setInvestPct(pct: number) {
  const v = Math.round(pct);
  if (!Number.isFinite(v) || v < 0 || v > 100) return;
  try {
    const { user, supabase } = await requireUser();
    await supabase.from("profiles").update({ invest_pct: v }).eq("id", user.id);
    revalidatePath("/app/orcamento");
  } catch (err) {
    safeError("settings.investpct", err);
  }
}

export async function setDashboardCards(cards: string[]) {
  const clean = cards.filter((c) => typeof c === "string").slice(0, 4);
  try {
    const { user, supabase } = await requireUser();
    await supabase.from("profiles").update({ dashboard_cards: clean }).eq("id", user.id);
    revalidatePath("/app");
  } catch (err) {
    safeError("settings.dashcards", err);
  }
}

export async function updateProfile(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Dados inválidos." };
  const d = parsed.data;

  try {
    const { user, supabase } = await requireUser();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: d.full_name,
        display_currency: d.display_currency,
        occupation: d.occupation || null,
        city: d.city || null,
        state: d.state || null,
        marketing_opt_in: d.marketing_opt_in === "on",
      })
      .eq("id", user.id);
    if (error) return { error: safeError("settings.update", error) };
    revalidatePath("/app/configuracoes");
    return { ok: true };
  } catch (err) {
    return { error: safeError("settings.update", err) };
  }
}
