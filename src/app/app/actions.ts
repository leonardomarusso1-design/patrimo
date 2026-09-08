"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePaidUser } from "@/lib/data";
import { safeError } from "@/lib/logger";

/**
 * Mutações genéricas para as tabelas "do usuário".
 * Segurança em camadas: RLS no banco é o guarda real; aqui validamos o payload
 * com zod, forçamos user_id = usuário logado e nunca devolvemos erro do Postgres.
 */

const money = z.coerce.number().min(0).max(1_000_000_000);
const signedMoney = z.coerce.number().min(-1_000_000_000).max(1_000_000_000);
const shortText = z.string().trim().min(1).max(120);

const SCHEMAS = {
  budget_entries: z.object({
    kind: z.enum(["income", "expense_fixed", "expense_variable"]),
    name: shortText,
    category: z.string().trim().max(60).optional().nullable(),
    amount: money,
    entry_date: z.string().date().optional().nullable(),
    due_day: z.coerce.number().int().min(1).max(31).optional().nullable(),
    reference_month: z.string().regex(/^\d{4}-\d{2}-01$/),
    notes: z.string().trim().max(300).optional().nullable(),
    recurring: z.coerce.boolean().default(false),
    pending: z.coerce.boolean().default(false),
  }),
  goals: z.object({
    name: shortText,
    target_amount: money.refine((n) => n > 0, "Informe um valor."),
    deadline: z.string().date().optional().nullable(),
    where_to_keep: z.string().trim().max(120).optional().nullable(),
  }),
  goal_contributions: z.object({
    goal_id: z.string().uuid(),
    amount: signedMoney.refine((n) => n !== 0, "Informe um valor."),
    contributed_on: z.string().date(),
  }),
  emergency_reserves: z.object({ label: shortText, amount: money }),
  investments: z.object({
    name: shortText,
    broker: z.string().trim().max(80).optional().nullable(),
    asset_class: z.enum(["renda_fixa", "acao", "fii", "etf", "cripto", "cash", "outro"]),
    currency: z.string().trim().length(3).default("BRL"),
    invested_amount: money,
    current_amount: money,
  }),
  patrimony_items: z.object({
    kind: z.enum(["liquidez", "investimento", "imovel", "veiculo", "outro_bem"]),
    name: shortText,
    value: money,
    appraised_value: money.optional().nullable(),
    currency: z.string().trim().length(3).default("BRL"),
    fipe_code: z.string().trim().max(40).optional().nullable(),
    is_debt: z.coerce.boolean().default(false),
    linked_debt_id: z.string().uuid().optional().nullable(),
  }),
  debts: z.object({
    name: shortText,
    total_amount: money,
    remaining_amount: money,
    monthly_interest: z.coerce.number().min(0).max(100).optional().nullable(),
    monthly_payment: money.optional().nullable(),
    due_day: z.coerce.number().int().min(1).max(31).optional().nullable(),
  }),
} as const;

type TableName = keyof typeof SCHEMAS;

function toObject(formData: FormData) {
  const raw: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    if (k === "_table" || k === "_id" || k === "_path") continue;
    raw[k] = v === "" ? null : v;
  }
  return raw;
}

export type MutationState = { error?: string; ok?: boolean };

export async function createRow(
  _prev: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const table = formData.get("_table") as TableName;
  const path = (formData.get("_path") as string) || "/app";
  const schema = SCHEMAS[table];
  if (!schema) return { error: "Recurso inválido." };

  const parsed = schema.safeParse(toObject(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    const { user, supabase } = await requirePaidUser();
    const { error } = await supabase
      .from(table)
      .insert({ ...parsed.data, user_id: user.id });
    if (error) return { error: safeError(`createRow.${table}`, error) };
    revalidatePath(path);
    return { ok: true };
  } catch (err) {
    return { error: safeError(`createRow.${table}`, err) };
  }
}

export async function updateRow(
  _prev: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const table = formData.get("_table") as TableName;
  const id = formData.get("_id") as string;
  const path = (formData.get("_path") as string) || "/app";
  const schema = SCHEMAS[table];
  if (!schema || !id) return { error: "Recurso inválido." };

  const parsed = schema.partial().safeParse(toObject(formData));
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    const { user, supabase } = await requirePaidUser();
    const { error } = await supabase
      .from(table)
      .update(parsed.data)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return { error: safeError(`updateRow.${table}`, error) };
    revalidatePath(path);
    return { ok: true };
  } catch (err) {
    return { error: safeError(`updateRow.${table}`, err) };
  }
}

export async function deleteRow(formData: FormData): Promise<void> {
  const table = formData.get("_table") as TableName;
  const id = formData.get("_id") as string;
  const path = (formData.get("_path") as string) || "/app";
  if (!SCHEMAS[table] || !id) return;
  try {
    const { user, supabase } = await requirePaidUser();
    await supabase.from(table).delete().eq("id", id).eq("user_id", user.id);
    revalidatePath(path);
  } catch (err) {
    safeError(`deleteRow.${table}`, err);
  }
}
