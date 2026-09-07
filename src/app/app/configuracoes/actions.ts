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
