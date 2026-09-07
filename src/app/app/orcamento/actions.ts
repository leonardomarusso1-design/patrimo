"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/data";
import { safeError } from "@/lib/logger";

export async function clearBudgetMonth(formData: FormData) {
  const month = z
    .string()
    .regex(/^\d{4}-\d{2}-01$/)
    .safeParse(formData.get("reference_month"));
  if (!month.success) return;

  try {
    const { user, supabase } = await requireUser();
    await supabase
      .from("budget_entries")
      .delete()
      .eq("user_id", user.id)
      .eq("reference_month", month.data);
    revalidatePath("/app/orcamento");
  } catch (err) {
    safeError("orcamento.clear", err);
  }
}
