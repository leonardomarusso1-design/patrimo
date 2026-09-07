import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeNetWorth } from "@/lib/networth";
import { buildAndStoreAdvice } from "@/lib/advice";
import { hasActiveAccess } from "@/lib/plans";
import { logger, safeError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function firstOfMonth(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

/**
 * Diário, por assinante ativo:
 *  1. atualiza a foto do patrimônio líquido do mês (net_worth_snapshots)
 *  2. gera a análise da IA (se tem perfil de investidor + carteira + >20h da última)
 */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const month = firstOfMonth();
    const { data: profiles, error } = await admin
      .from("profiles")
      .select("id, plan, plan_expires_at, display_currency, investor_profile");
    if (error) {
      return NextResponse.json({ error: safeError("cron.daily", error) }, { status: 500 });
    }

    const adviceCutoff = new Date(Date.now() - 20 * 3600 * 1000).toISOString();
    let snapshots = 0;
    let advices = 0;

    for (const p of profiles ?? []) {
      if (p.plan === "free" || !hasActiveAccess(p)) continue;

      // 1. snapshot do patrimônio
      const nw = await computeNetWorth(admin, p.id, p.display_currency);
      const { error: upErr } = await admin.from("net_worth_snapshots").upsert(
        {
          user_id: p.id,
          month,
          net_worth: nw.netWorth,
          assets: nw.assets,
          wallet: nw.wallet,
          reserve: nw.reserve,
          debts: nw.debts,
        },
        { onConflict: "user_id,month" },
      );
      if (!upErr) snapshots++;

      // 2. análise da IA
      if (!p.investor_profile) continue;
      const { data: last } = await admin
        .from("investment_advice")
        .select("created_at")
        .eq("user_id", p.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (last && last.created_at > adviceCutoff) continue;

      const { data: hasInv } = await admin
        .from("investments")
        .select("id")
        .eq("user_id", p.id)
        .limit(1)
        .maybeSingle();
      if (!hasInv) continue;

      const r = await buildAndStoreAdvice(p.id, p.investor_profile, p.display_currency, admin);
      if (r.inserted) advices++;
    }

    logger.info("cron.daily.done", {
      candidates: profiles?.length ?? 0,
      snapshots,
      advices,
    });
    return NextResponse.json({ ok: true, snapshots, advices });
  } catch (err) {
    return NextResponse.json({ error: safeError("cron.daily", err) }, { status: 500 });
  }
}
