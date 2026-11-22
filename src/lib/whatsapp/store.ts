import "server-only";

import { randomInt, randomUUID } from "node:crypto";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import type { BudgetKind, Database, InvestorProfile, PlanId } from "@/types/database";
import type { EntryDraft, UserRule } from "./classify";
import { decryptPhone, encryptPhone, hashCode, maskPhone } from "./phone";
import { quotaPeriod } from "./quota";
import { addDaysIso, fold } from "./text";
import type { EntryRow } from "./reports";

type Admin = SupabaseClient<Database>;

function db(): Admin {
  return createAdminClient();
}

function boom(scope: string, code?: string): never {
  logger.error(scope, { code: code ?? "db" });
  throw new Error(scope);
}

const draftSchema = z.object({
  kind: z.enum(["income", "expense_fixed", "expense_variable"]),
  name: z.string().min(1).max(120),
  category: z.string().max(60).nullable(),
  amount: z.number().positive().max(100_000_000),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  recurring: z.boolean(),
  dueDay: z.number().int().min(1).max(31).nullable(),
  installmentsTotal: z.number().int().min(2).max(48).nullable(),
  confidence: z.number().min(0).max(1),
  rulePattern: z.string().max(80).nullable(),
  accountId: z.string().uuid().nullable(),
  cardId: z.string().uuid().nullable(),
  requireConfirm: z.boolean(),
  categoryUnlisted: z.boolean(),
});

const pendingSchema = z.object({
  v: z.literal(1),
  step: z.enum(["confirm", "category"]),
  draft: draftSchema,
});

export type Pending = z.infer<typeof pendingSchema>;

export type LinkRow = {
  user_id: string;
  phone_ciphertext: string | null;
  active: boolean;
  alerts_opt_in: boolean;
  daily_digest: boolean;
  weekly_digest: boolean;
  monthly_digest: boolean;
  verified_at: string | null;
  last_entry_id: string | null;
  last_entry_at: string | null;
  last_daily_on: string | null;
  last_weekly_on: string | null;
  last_monthly_on: string | null;
};

const LINK_COLS =
  "user_id, phone_ciphertext, active, alerts_opt_in, daily_digest, weekly_digest, monthly_digest, verified_at, last_entry_id, last_entry_at, last_daily_on, last_weekly_on, last_monthly_on";

export async function recordInbound(input: {
  waId: string;
  phoneHash: string;
  kind: string;
  userId?: string | null;
}): Promise<"ok" | "dup"> {
  const { error } = await db().from("whatsapp_messages").insert({
    wa_message_id: input.waId,
    phone_hash: input.phoneHash,
    direction: "in",
    kind: input.kind,
    user_id: input.userId ?? null,
  });
  if (error?.code === "23505") return "dup";
  if (error) boom("whatsapp.inbound", error.code);
  return "ok";
}

export async function deleteInbound(waId: string) {
  await db().from("whatsapp_messages").delete().eq("wa_message_id", waId);
}

export async function markAction(waId: string, action: string, userId?: string | null) {
  await db()
    .from("whatsapp_messages")
    .update({ action, user_id: userId ?? null })
    .eq("wa_message_id", waId);
}

export async function logOutbound(userId: string | null, phoneHash: string, waId: string | null, action: string) {
  const { error } = await db().from("whatsapp_messages").insert({
    wa_message_id: waId ?? `out:${randomUUID()}`,
    phone_hash: phoneHash,
    user_id: userId,
    direction: "out",
    kind: "text",
    action,
  });
  if (error && error.code !== "23505") logger.warn("whatsapp.outbound_log", { code: error.code });
}

export async function countSince(phoneHash: string, sinceIso: string, actions?: string[]): Promise<number> {
  let q = db()
    .from("whatsapp_messages")
    .select("id", { count: "exact", head: true })
    .eq("phone_hash", phoneHash)
    .eq("direction", "in")
    .gte("created_at", sinceIso);
  if (actions?.length) q = q.in("action", actions);
  const { count, error } = await q;
  if (error) boom("whatsapp.count", error.code);
  return count ?? 0;
}

export async function findLinkByPhone(phoneHash: string): Promise<LinkRow | null> {
  const { data, error } = await db()
    .from("whatsapp_links")
    .select(LINK_COLS)
    .eq("phone_hash", phoneHash)
    .maybeSingle();
  if (error) boom("whatsapp.link", error.code);
  return data;
}

export async function phoneInUse(phoneHash: string, exceptUser: string): Promise<boolean> {
  const { data, error } = await db()
    .from("whatsapp_links")
    .select("user_id")
    .eq("phone_hash", phoneHash)
    .neq("user_id", exceptUser)
    .maybeSingle();
  if (error) boom("whatsapp.phone_in_use", error.code);
  return Boolean(data);
}

export async function findUserByCode(code: string, pepper: string): Promise<string | null> {
  const { data, error } = await db()
    .from("whatsapp_links")
    .select("user_id, verify_expires_at")
    .eq("verify_code_hash", hashCode(code, pepper))
    .maybeSingle();
  if (error) boom("whatsapp.code", error.code);
  if (!data?.verify_expires_at) return null;
  if (new Date(data.verify_expires_at).getTime() < Date.now()) return null;
  return data.user_id;
}

export async function bindPhone(userId: string, phoneHash: string, ciphertext: string) {
  const { error } = await db()
    .from("whatsapp_links")
    .update({
      phone_hash: phoneHash,
      phone_ciphertext: ciphertext,
      verified_at: new Date().toISOString(),
      consent_at: new Date().toISOString(),
      active: true,
      verify_code_hash: null,
      verify_expires_at: null,
    })
    .eq("user_id", userId);
  if (error) boom("whatsapp.bind", error.code);
}

export type BotProfile = {
  id: string;
  email: string;
  full_name: string | null;
  display_currency: string;
  plan: PlanId;
  plan_expires_at: string | null;
  investor_profile: InvestorProfile | null;
};

export async function getBotProfile(userId: string): Promise<BotProfile | null> {
  const { data, error } = await db()
    .from("profiles")
    .select("id, email, full_name, display_currency, plan, plan_expires_at, investor_profile")
    .eq("id", userId)
    .maybeSingle();
  if (error) boom("whatsapp.profile", error.code);
  return data;
}

export async function loadClassifyContext(userId: string): Promise<{
  rules: UserRule[];
  categories: { name: string; kind: BudgetKind }[];
  accounts: { id: string; name: string }[];
  cards: { id: string; name: string }[];
}> {
  const admin = db();
  const [rules, cats, accounts, cards] = await Promise.all([
    admin.from("user_category_rules").select("pattern, category, kind").eq("user_id", userId),
    admin.from("budget_categories").select("name, kind").eq("user_id", userId).eq("archived", false),
    admin.from("accounts").select("id, name").eq("user_id", userId).eq("archived", false),
    admin.from("cards").select("id, name").eq("user_id", userId).eq("archived", false),
  ]);
  if (rules.error) boom("whatsapp.rules", rules.error.code);
  if (cats.error) boom("whatsapp.cats", cats.error.code);
  if (accounts.error) boom("whatsapp.accounts", accounts.error.code);
  if (cards.error) boom("whatsapp.cards", cards.error.code);
  return {
    rules: (rules.data ?? []).map((r) => ({
      pattern: r.pattern,
      category: r.category,
      kind: (r.kind as BudgetKind | null) ?? null,
    })),
    categories: cats.data ?? [],
    accounts: accounts.data ?? [],
    cards: cards.data ?? [],
  };
}

export async function getPending(userId: string): Promise<Pending | null> {
  const { data, error } = await db()
    .from("whatsapp_pending")
    .select("payload, expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) boom("whatsapp.pending", error.code);
  if (!data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) {
    await clearPending(userId);
    return null;
  }
  const parsed = pendingSchema.safeParse(data.payload);
  if (!parsed.success) {
    await clearPending(userId);
    return null;
  }
  return parsed.data;
}

export async function setPending(userId: string, step: Pending["step"], draft: EntryDraft) {
  const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const payload = { v: 1 as const, step, draft };
  const { error } = await db().from("whatsapp_pending").upsert(
    { user_id: userId, payload, expires_at: expires },
    { onConflict: "user_id" },
  );
  if (error) boom("whatsapp.pending_set", error.code);
}

export async function clearPending(userId: string) {
  await db().from("whatsapp_pending").delete().eq("user_id", userId);
}

export async function insertEntry(userId: string, draft: EntryDraft): Promise<string> {
  const month = `${draft.entryDate.slice(0, 7)}-01`;
  const { data, error } = await db()
    .from("budget_entries")
    .insert({
      user_id: userId,
      kind: draft.kind,
      name: draft.name.slice(0, 120),
      category: draft.category,
      amount: draft.amount,
      due_day: draft.dueDay,
      reference_month: month,
      entry_date: draft.entryDate,
      recurring: draft.recurring,
      pending: false,
      account_id: draft.accountId,
      card_id: draft.cardId,
      installments_total: draft.installmentsTotal,
      installments_paid: draft.installmentsTotal ? 1 : null,
      source: "whatsapp",
      confidence: draft.confidence,
    })
    .select("id")
    .single();
  if (error || !data) boom("whatsapp.entry", error?.code);
  await db()
    .from("whatsapp_links")
    .update({ last_entry_id: data.id, last_entry_at: new Date().toISOString() })
    .eq("user_id", userId);
  return data.id;
}

export async function rememberRule(userId: string, draft: EntryDraft) {
  if (!draft.rulePattern || draft.rulePattern.length < 3 || !draft.category) return;
  await db().from("user_category_rules").upsert(
    {
      user_id: userId,
      pattern: draft.rulePattern,
      category: draft.category,
      kind: draft.kind,
    },
    { onConflict: "user_id,pattern" },
  );
}

async function recentEntry(userId: string): Promise<{ id: string } | null> {
  const { data, error } = await db()
    .from("whatsapp_links")
    .select("last_entry_id, last_entry_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data?.last_entry_id || !data.last_entry_at) return null;
  if (Date.now() - new Date(data.last_entry_at).getTime() > 48 * 3600 * 1000) return null;
  return { id: data.last_entry_id };
}

export async function undoLast(userId: string): Promise<boolean> {
  const last = await recentEntry(userId);
  if (!last) return false;
  const { error } = await db().from("budget_entries").delete().eq("id", last.id).eq("user_id", userId);
  if (error) boom("whatsapp.undo", error.code);
  await db()
    .from("whatsapp_links")
    .update({ last_entry_id: null, last_entry_at: null })
    .eq("user_id", userId);
  return true;
}

export async function patchLast(
  userId: string,
  patch: { amount?: number; kind?: BudgetKind; category?: string },
): Promise<boolean> {
  const last = await recentEntry(userId);
  if (!last) return false;
  const { error } = await db().from("budget_entries").update(patch).eq("id", last.id).eq("user_id", userId);
  if (error) boom("whatsapp.patch", error.code);
  if (patch.category) {
    const { data } = await db().from("budget_entries").select("name, kind").eq("id", last.id).maybeSingle();
    if (data) {
      await rememberRule(userId, {
        kind: (patch.kind ?? data.kind) as BudgetKind,
        name: data.name,
        category: patch.category,
        amount: patch.amount ?? 1,
        entryDate: "2000-01-01",
        recurring: false,
        dueDay: null,
        installmentsTotal: null,
        confidence: 1,
        rulePattern: fold(data.name).slice(0, 60),
        accountId: null,
        cardId: null,
        requireConfirm: false,
        categoryUnlisted: false,
      });
    }
  }
  return true;
}

export async function markPaid(userId: string, query: string): Promise<"one" | "many" | "none"> {
  const safe = query.replace(/[%_]/g, "").trim();
  if (safe.length < 2) return "none";
  const { data, error } = await db()
    .from("budget_entries")
    .select("id")
    .eq("user_id", userId)
    .eq("pending", true)
    .neq("kind", "income")
    .ilike("name", `%${safe}%`)
    .limit(5);
  if (error) boom("whatsapp.paid", error.code);
  if (!data?.length) return "none";
  if (data.length > 1) return "many";
  const upd = await db().from("budget_entries").update({ pending: false }).eq("id", data[0].id).eq("user_id", userId);
  if (upd.error) boom("whatsapp.paid_set", upd.error.code);
  return "one";
}

export async function entriesFor(userId: string, fromMonth: string, toMonth: string): Promise<EntryRow[]> {
  const { data, error } = await db()
    .from("budget_entries")
    .select("kind, name, category, amount, pending, entry_date, due_day, reference_month")
    .eq("user_id", userId)
    .gte("reference_month", `${fromMonth}-01`)
    .lte("reference_month", `${toMonth}-01`);
  if (error) boom("whatsapp.entries", error.code);
  return (data ?? []).map((r) => ({ ...r, amount: Number(r.amount) }));
}

export async function reserveOf(userId: string): Promise<{ saved: number; target: number }> {
  const admin = db();
  const [fund, rows] = await Promise.all([
    admin.from("emergency_fund").select("essential_monthly_cost, protection_level").eq("user_id", userId).maybeSingle(),
    admin.from("emergency_reserves").select("amount").eq("user_id", userId),
  ]);
  if (fund.error) boom("whatsapp.fund", fund.error.code);
  if (rows.error) boom("whatsapp.reserve", rows.error.code);
  const saved = (rows.data ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const months = fund.data?.protection_level === "shield" ? 12 : 6;
  const target = Number(fund.data?.essential_monthly_cost ?? 0) * months;
  return { saved, target };
}

export async function holdingsOf(userId: string) {
  const { data, error } = await db()
    .from("investments")
    .select("asset_class, current_amount")
    .eq("user_id", userId);
  if (error) boom("whatsapp.holdings", error.code);
  return (data ?? []).map((r) => ({ asset_class: r.asset_class, current_amount: Number(r.current_amount) }));
}

export async function latestNetWorth(userId: string): Promise<number | null> {
  const { data, error } = await db()
    .from("net_worth_snapshots")
    .select("net_worth, month")
    .eq("user_id", userId)
    .order("month", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) boom("whatsapp.networth", error.code);
  return data ? Number(data.net_worth) : null;
}

async function ensureUsage(userId: string, period: string) {
  const { error } = await db().from("whatsapp_usage").insert({
    user_id: userId,
    period,
    used: 0,
    bonus: 0,
  });
  if (error && error.code !== "23505") boom("whatsapp.usage_init", error.code);
}

export async function readUsage(userId: string): Promise<{ used: number; bonus: number }> {
  const period = quotaPeriod();
  const { data, error } = await db()
    .from("whatsapp_usage")
    .select("used, bonus")
    .eq("user_id", userId)
    .eq("period", period)
    .maybeSingle();
  if (error) return { used: 0, bonus: 0 };
  return { used: data?.used ?? 0, bonus: data?.bonus ?? 0 };
}

export async function consumeQuota(userId: string, limit: number): Promise<{ ok: boolean; cap: number }> {
  const period = quotaPeriod();
  await ensureUsage(userId, period);
  for (let i = 0; i < 2; i++) {
    const { data, error } = await db()
      .from("whatsapp_usage")
      .select("used, bonus")
      .eq("user_id", userId)
      .eq("period", period)
      .single();
    if (error || !data) boom("whatsapp.usage", error?.code);
    const cap = limit + data.bonus;
    if (data.used >= cap) return { ok: false, cap };
    const upd = await db()
      .from("whatsapp_usage")
      .update({ used: data.used + 1 })
      .eq("user_id", userId)
      .eq("period", period)
      .eq("used", data.used)
      .select("used")
      .maybeSingle();
    if (upd.data) return { ok: true, cap };
  }
  return { ok: false, cap: limit };
}

export async function refundQuota(userId: string) {
  const period = quotaPeriod();
  const { data } = await db()
    .from("whatsapp_usage")
    .select("used")
    .eq("user_id", userId)
    .eq("period", period)
    .maybeSingle();
  if (!data) return;
  await db()
    .from("whatsapp_usage")
    .update({ used: Math.max(0, data.used - 1) })
    .eq("user_id", userId)
    .eq("period", period)
    .eq("used", data.used);
}

export async function changeBonus(userId: string, period: string, delta: number) {
  await ensureUsage(userId, period);
  const { data, error } = await db()
    .from("whatsapp_usage")
    .select("bonus")
    .eq("user_id", userId)
    .eq("period", period)
    .single();
  if (error || !data) boom("whatsapp.bonus", error?.code);
  const bonus = Math.max(0, data.bonus + delta);
  const upd = await db().from("whatsapp_usage").update({ bonus }).eq("user_id", userId).eq("period", period);
  if (upd.error) boom("whatsapp.bonus_set", upd.error.code);
}

export async function listAlertLinks(): Promise<LinkRow[]> {
  const { data, error } = await db()
    .from("whatsapp_links")
    .select(LINK_COLS)
    .eq("active", true)
    .eq("alerts_opt_in", true)
    .not("phone_ciphertext", "is", null);
  if (error) boom("whatsapp.alert_links", error.code);
  return data ?? [];
}

export async function markDigest(userId: string, kind: "daily" | "weekly" | "monthly", todayIso: string) {
  const patch =
    kind === "daily"
      ? { last_daily_on: todayIso }
      : kind === "weekly"
        ? { last_weekly_on: todayIso }
        : { last_monthly_on: todayIso };
  await db().from("whatsapp_links").update(patch).eq("user_id", userId);
}

export async function purgeOldMessages() {
  const cutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  await db().from("whatsapp_messages").delete().lt("created_at", cutoff);
  await db().from("whatsapp_pending").delete().lt("expires_at", new Date().toISOString());
}

export function phoneOf(link: LinkRow, pepper: string): string | null {
  if (!link.phone_ciphertext) return null;
  return decryptPhone(link.phone_ciphertext, pepper);
}

export function ciphertextFor(phone: string, pepper: string): string {
  return encryptPhone(phone, pepper);
}

export async function issueVerifyCode(userId: string, pepper: string): Promise<string | null> {
  const admin = db();
  for (let i = 0; i < 5; i++) {
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const verify_code_hash = hashCode(code, pepper);
    const verify_expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const { data: existing } = await admin.from("whatsapp_links").select("user_id").eq("user_id", userId).maybeSingle();
    const write = existing
      ? await admin.from("whatsapp_links").update({ verify_code_hash, verify_expires_at }).eq("user_id", userId)
      : await admin.from("whatsapp_links").insert({ user_id: userId, verify_code_hash, verify_expires_at });
    if (!write.error) return code;
    if (write.error.code !== "23505") boom("whatsapp.code_issue", write.error.code);
  }
  return null;
}

export async function disconnectUser(userId: string) {
  await clearPending(userId);
  const { error } = await db()
    .from("whatsapp_links")
    .update({
      phone_hash: null,
      phone_ciphertext: null,
      verified_at: null,
      active: false,
      verify_code_hash: null,
      verify_expires_at: null,
      alerts_opt_in: false,
    })
    .eq("user_id", userId);
  if (error) boom("whatsapp.disconnect", error.code);
}

export async function savePrefs(
  userId: string,
  prefs: { alerts: boolean; daily: boolean; weekly: boolean; monthly: boolean },
) {
  const { error } = await db()
    .from("whatsapp_links")
    .update({
      alerts_opt_in: prefs.alerts,
      daily_digest: prefs.daily,
      weekly_digest: prefs.weekly,
      monthly_digest: prefs.monthly,
    })
    .eq("user_id", userId)
    .eq("active", true);
  if (error) boom("whatsapp.prefs", error.code);
}

export async function purgeHistory(userId: string) {
  const admin = db();
  await admin.from("whatsapp_messages").delete().eq("user_id", userId);
  await admin.from("user_category_rules").delete().eq("user_id", userId);
  await clearPending(userId);
}

export async function readLinkPublic(userId: string, pepper: string | null): Promise<{
  linked: boolean;
  masked: string | null;
  alerts: boolean;
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
} | null> {
  const { data, error } = await db()
    .from("whatsapp_links")
    .select("active, phone_ciphertext, alerts_opt_in, daily_digest, weekly_digest, monthly_digest, verified_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return null;
  if (!data) {
    return { linked: false, masked: null, alerts: false, daily: false, weekly: true, monthly: true };
  }
  const phone = pepper && data.phone_ciphertext ? decryptPhone(data.phone_ciphertext, pepper) : null;
  return {
    linked: Boolean(data.active && data.verified_at && data.phone_ciphertext),
    masked: phone ? maskPhone(phone) : null,
    alerts: data.alerts_opt_in,
    daily: data.daily_digest,
    weekly: data.weekly_digest,
    monthly: data.monthly_digest,
  };
}

export function windowStart(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

export function tomorrowIso(today: string): string {
  return addDaysIso(today, 1);
}
