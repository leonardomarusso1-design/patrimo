"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/data";
import { safeError } from "@/lib/logger";

const schema = z.object({
  protection_level: z.enum(["basic", "shield"]),
  essential_monthly_cost: z.coerce.number().min(0).max(10_000_000),
});

export type ReservaState = { error?: string; ok?: boolean };

export async function saveEmergencyFund(
  _prev: ReservaState,
  formData: FormData,
): Promise<ReservaState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Dados inválidos." };

  try {
    const { user, supabase } = await requireUser();
    const { error } = await supabase.from("emergency_fund").upsert(
      { user_id: user.id, ...parsed.data },
      { onConflict: "user_id" },
    );
    if (error) return { error: safeError("reserva.save", error) };
    revalidatePath("/app/reserva");
    return { ok: true };
  } catch (err) {
    return { error: safeError("reserva.save", err) };
  }
}
