import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { readPackSize } from "./config";
import { quotaPeriod } from "./quota";
import { changeBonus } from "./store";

/**
 * Crédito do pacote avulso. O produto na Kiwify ainda pode não existir:
 * sem KIWIFY_WHATSAPP_PACK_PRODUCT_ID nada aqui roda e o plano anual segue igual.
 * Compra de quem ainda não tem conta fica pendente, no e-mail, até a pessoa entrar.
 */
export async function applyWhatsappPack(input: {
  email: string;
  userId: string | null;
  orderRef: string;
  action: "grant" | "revoke";
}): Promise<void> {
  const admin = createAdminClient();
  const email = input.email.trim().toLowerCase();
  const orderRef = input.orderRef.trim() || `pack:${crypto.randomUUID()}`;

  if (input.action === "revoke") {
    const { data } = await admin
      .from("whatsapp_pack_grants")
      .select("id, user_id, messages, period, revoked")
      .eq("order_ref", orderRef)
      .maybeSingle();
    if (!data || data.revoked) return;
    if (data.user_id && data.period !== "pending") {
      await changeBonus(data.user_id, data.period, -data.messages);
    }
    await admin.from("whatsapp_pack_grants").update({ revoked: true }).eq("id", data.id);
    logger.info("whatsapp.pack.revoke", { hasUser: Boolean(data.user_id) });
    return;
  }

  const messages = readPackSize();
  const period = input.userId ? quotaPeriod() : "pending";
  const { error } = await admin.from("whatsapp_pack_grants").insert({
    user_id: input.userId,
    email,
    order_ref: orderRef,
    messages,
    period,
  });
  if (error?.code === "23505") return;
  if (error) {
    logger.error("whatsapp.pack.grant", { code: error.code });
    throw new Error("whatsapp.pack.grant");
  }
  if (input.userId) await changeBonus(input.userId, period, messages);
  logger.info("whatsapp.pack.grant", { hasUser: Boolean(input.userId) });
}

export async function claimPendingPacks(userId: string, email: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whatsapp_pack_grants")
    .select("id, messages")
    .eq("email", email.trim().toLowerCase())
    .eq("period", "pending")
    .eq("revoked", false)
    .is("user_id", null);
  if (error || !data?.length) return;
  const period = quotaPeriod();
  for (const row of data) {
    await changeBonus(userId, period, row.messages);
    await admin
      .from("whatsapp_pack_grants")
      .update({ user_id: userId, period })
      .eq("id", row.id)
      .is("user_id", null);
  }
}
