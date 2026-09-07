"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/data";
import { safeError } from "@/lib/logger";

const importSchema = z.object({
  reference_month: z.string().regex(/^\d{4}-\d{2}-01$/),
  items: z
    .array(
      z.object({
        kind: z.enum(["income", "expense_fixed", "expense_variable"]),
        name: z.string().trim().min(1).max(120),
        category: z.string().trim().max(60).optional().nullable(),
        amount: z.number().min(0).max(100_000_000),
        entry_date: z.string().date().optional().nullable(),
        due_day: z.number().int().min(1).max(31).optional().nullable(),
      }),
    )
    .min(1)
    .max(500),
});

export type ImportState = { error?: string; inserted?: number };

export async function importBudgetCsv(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload")));
  } catch {
    return { error: "Arquivo inválido." };
  }
  const parsed = importSchema.safeParse(payload);
  if (!parsed.success) return { error: "Não consegui ler os lançamentos do arquivo." };

  try {
    const { user, supabase } = await requireUser();
    const rows = parsed.data.items.map((it) => ({
      ...it,
      user_id: user.id,
      reference_month: parsed.data.reference_month,
    }));
    const { error, count } = await supabase
      .from("budget_entries")
      .insert(rows, { count: "exact" });
    if (error) return { error: safeError("orcamento.import", error) };
    revalidatePath("/app/orcamento");
    return { inserted: count ?? rows.length };
  } catch (err) {
    return { error: safeError("orcamento.import", err) };
  }
}

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
