"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser, requirePaidUser } from "@/lib/data";
import { safeError, logger } from "@/lib/logger";
import {
  pluggyConfigured,
  createConnectToken,
  getItem,
  listAccounts,
  listTransactions,
  deleteItem,
} from "@/lib/pluggy";
import type { InsertDto } from "@/types/database";

export type ConnState = { error?: string; ok?: boolean; token?: string; imported?: number };

export async function getConnectToken(): Promise<ConnState> {
  if (!pluggyConfigured()) return { error: "Open Finance ainda não está configurado." };
  try {
    await requireUser();
    return { token: await createConnectToken() };
  } catch (err) {
    return { error: safeError("pluggy.token", err) };
  }
}

/** Após o widget concluir: salva o item e faz a primeira sincronização. */
export async function saveConnection(itemId: string): Promise<ConnState> {
  const parsed = z.string().min(10).max(80).safeParse(itemId);
  if (!parsed.success) return { error: "Conexão inválida." };

  try {
    const { user, supabase } = await requirePaidUser();
    // impede sequestrar um item já vinculado a outra conta
    const { data: owned } = await supabase
      .from("bank_connections")
      .select("user_id")
      .eq("pluggy_item_id", parsed.data)
      .maybeSingle();
    if (owned && owned.user_id !== user.id) {
      return { error: "Essa conexão já pertence a outra conta." };
    }
    const item = await getItem(parsed.data);
    await supabase.from("bank_connections").upsert(
      {
        user_id: user.id,
        pluggy_item_id: parsed.data,
        institution_name: item.connector?.name ?? "Banco",
        status: item.status ?? "connected",
      },
      { onConflict: "pluggy_item_id" },
    );
    const imported = await syncItem(user.id, supabase, parsed.data, 90);
    revalidatePath("/app/conexoes");
    revalidatePath("/app/orcamento");
    return { ok: true, imported };
  } catch (err) {
    return { error: safeError("pluggy.save", err) };
  }
}

export async function syncConnection(formData: FormData): Promise<void> {
  const itemId = String(formData.get("item_id"));
  try {
    const { user, supabase } = await requirePaidUser();
    const { data: conn } = await supabase
      .from("bank_connections")
      .select("last_synced_at")
      .eq("user_id", user.id)
      .eq("pluggy_item_id", itemId)
      .maybeSingle();
    if (!conn) return; // não é uma conexão desta conta
    const days = conn?.last_synced_at
      ? Math.min(
          Math.max(
            Math.ceil((Date.now() - new Date(conn.last_synced_at).getTime()) / 86400000) + 5,
            35,
          ),
          365,
        )
      : 90;
    await syncItem(user.id, supabase, itemId, days);
    revalidatePath("/app/conexoes");
    revalidatePath("/app/orcamento");
  } catch (err) {
    safeError("pluggy.sync", err);
  }
}

export async function removeConnection(formData: FormData): Promise<void> {
  const itemId = String(formData.get("item_id"));
  try {
    const { user, supabase } = await requirePaidUser();
    const { data: removed } = await supabase
      .from("bank_connections")
      .delete()
      .eq("user_id", user.id)
      .eq("pluggy_item_id", itemId)
      .select("id");
    if (!removed || removed.length === 0) return; // não era desta conta
    await deleteItem(itemId);
    revalidatePath("/app/conexoes");
  } catch (err) {
    safeError("pluggy.remove", err);
  }
}

type SB = Awaited<ReturnType<typeof requireUser>>["supabase"];

async function syncItem(
  userId: string,
  supabase: SB,
  itemId: string,
  days: number,
): Promise<number> {
  const fromISO = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const accounts = await listAccounts(itemId);
  const rows: InsertDto<"budget_entries">[] = [];

  for (const acc of accounts) {
    const txns = await listTransactions(acc.id, fromISO);
    for (const t of txns) {
      if (!t.amount) continue;
      const date = t.date.slice(0, 10);
      rows.push({
        user_id: userId,
        kind: t.amount > 0 ? "income" : "expense_variable",
        name: (t.description || "Lançamento").slice(0, 120),
        category: t.category ? String(t.category).slice(0, 60) : null,
        amount: Math.abs(t.amount),
        entry_date: date,
        reference_month: `${date.slice(0, 7)}-01`,
        external_id: `pluggy:${t.id}`,
      });
    }
  }

  let inserted = 0;
  if (rows.length) {
    const { error, count } = await supabase
      .from("budget_entries")
      .upsert(rows, { onConflict: "user_id,external_id", ignoreDuplicates: true, count: "estimated" });
    if (error) {
      logger.error("pluggy.sync.upsert", { error: error.message });
      return -1; // não avança o last_synced_at
    }
    inserted = count ?? rows.length;
  }

  // só marca como sincronizado quando deu certo
  await supabase
    .from("bank_connections")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("pluggy_item_id", itemId);

  return inserted;
}
