"use server";

import { headers } from "next/headers";
import { requireUser, getProfile, currentReferenceMonth } from "@/lib/data";
import { requirePaidAccess } from "@/lib/data";
import { checkRateLimit, ipFromHeaders } from "@/lib/rate-limit";
import { safeError } from "@/lib/logger";
import {
  askFinanceCoach,
  type ChatMsg,
  type FinanceSnapshot,
} from "@/lib/finance-chat";

export type ChatState = { reply?: string; error?: string };

const MAX_LEN = 800;

function sanitize(history: unknown): ChatMsg[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (m): m is ChatMsg =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_LEN) }));
}

export async function askAssistant(history: ChatMsg[]): Promise<ChatState> {
  const profile = await requirePaidAccess();
  const msgs = sanitize(history);
  if (!msgs.length || msgs[msgs.length - 1].role !== "user")
    return { error: "Envie uma pergunta." };

  const ip = ipFromHeaders(await headers());
  const rl = await checkRateLimit("ai", `chat:${profile.id}:${ip}`);
  if (!rl.ok) return { error: "Muitas perguntas seguidas. Tente de novo em alguns minutos." };

  try {
    const { user, supabase } = await requireUser();
    const p = await getProfile();
    const month = currentReferenceMonth();

    const [{ data: entries }, { data: reserves }, { data: goals }, { data: gc }, { data: debts }, { data: nw }] =
      await Promise.all([
        supabase
          .from("budget_entries")
          .select("kind, amount, pending")
          .eq("user_id", user.id)
          .eq("reference_month", month),
        supabase.from("emergency_reserves").select("amount").eq("user_id", user.id),
        supabase
          .from("goals")
          .select("id, name, target_amount")
          .eq("user_id", user.id)
          .eq("archived", false),
        supabase.from("goal_contributions").select("goal_id, amount").eq("user_id", user.id),
        supabase.from("debts").select("remaining_amount").eq("user_id", user.id),
        supabase
          .from("net_worth_snapshots")
          .select("net_worth")
          .eq("user_id", user.id)
          .order("month", { ascending: false })
          .limit(1),
      ]);

    const paid = (entries ?? []).filter((e) => !e.pending);
    const sumKind = (k: string) =>
      paid.filter((e) => e.kind === k).reduce((s, e) => s + Number(e.amount), 0);
    const income = sumKind("income");
    const fixed = sumKind("expense_fixed");
    const variable = sumKind("expense_variable");
    const savedByGoal = new Map<string, number>();
    for (const c of gc ?? [])
      savedByGoal.set(c.goal_id, (savedByGoal.get(c.goal_id) ?? 0) + Number(c.amount));

    const snapshot: FinanceSnapshot = {
      currency: p.display_currency,
      month: month.slice(0, 7),
      income,
      fixed,
      variable,
      balance: income - fixed - variable,
      reserve: (reserves ?? []).reduce((s, r) => s + Number(r.amount), 0),
      goals: (goals ?? []).map((g) => ({
        name: g.name,
        target: Number(g.target_amount),
        saved: savedByGoal.get(g.id) ?? 0,
      })),
      debtsRemaining: (debts ?? []).reduce((s, d) => s + Number(d.remaining_amount), 0),
      netWorth: nw?.[0] ? Number(nw[0].net_worth) : null,
    };

    const reply = await askFinanceCoach(snapshot, msgs);
    return { reply };
  } catch (err) {
    return { error: safeError("assistant.ask", err) };
  }
}
