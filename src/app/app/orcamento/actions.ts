"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePaidUser } from "@/lib/data";
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
    const { user, supabase } = await requirePaidUser();
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

/** Confirma um lançamento previsto: passa a contar nos totais do mês. */
export async function confirmPending(id: string, path: string) {
  if (!id) return;
  const safePath = path.startsWith("/app/orcamento") ? path : "/app/orcamento";
  try {
    const { user, supabase } = await requirePaidUser();
    await supabase
      .from("budget_entries")
      .update({ pending: false })
      .eq("id", id)
      .eq("user_id", user.id);
    revalidatePath(safePath);
    revalidatePath("/app");
  } catch (err) {
    safeError("orcamento.confirmPending", err);
  }
}

/**
 * Copia os lançamentos recorrentes do mês anterior para `refMonth` que ainda
 * não existem lá (dedup por kind+name). Ação explícita — nada roda no render.
 */
export async function carryRecurring(refMonth: string) {
  if (!/^\d{4}-\d{2}-01$/.test(refMonth)) return;
  const [y, m] = refMonth.split("-").map(Number);
  const prev = new Date(y, m - 2, 1);
  const prevMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-01`;

  try {
    const { user, supabase } = await requirePaidUser();
    const [{ data: templates }, { data: existing }] = await Promise.all([
      supabase
        .from("budget_entries")
        .select("kind, name, category, amount, due_day")
        .eq("user_id", user.id)
        .eq("reference_month", prevMonth)
        .eq("recurring", true),
      supabase
        .from("budget_entries")
        .select("kind, name")
        .eq("user_id", user.id)
        .eq("reference_month", refMonth),
    ]);
    const have = new Set((existing ?? []).map((r) => `${r.kind}::${r.name.toLowerCase()}`));
    const rows = (templates ?? [])
      .filter((t) => !have.has(`${t.kind}::${t.name.toLowerCase()}`))
      .map((t) => ({
        user_id: user.id,
        reference_month: refMonth,
        kind: t.kind,
        name: t.name,
        category: t.category,
        amount: t.amount,
        due_day: t.due_day,
        entry_date: refMonth,
        recurring: true,
        pending: false,
      }));
    if (rows.length) {
      await supabase.from("budget_entries").insert(rows);
      revalidatePath("/app/orcamento");
    }
  } catch (err) {
    safeError("orcamento.carryRecurring", err);
  }
}

export async function clearBudgetMonth(formData: FormData) {
  const month = z
    .string()
    .regex(/^\d{4}-\d{2}-01$/)
    .safeParse(formData.get("reference_month"));
  if (!month.success) return;

  try {
    const { user, supabase } = await requirePaidUser();
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
