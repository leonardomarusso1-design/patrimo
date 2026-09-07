import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildAndStoreAdvice } from "@/lib/advice";
import { hasActiveAccess } from "@/lib/plans";
import { logger, safeError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Diário: gera a análise da IA para quem tem perfil de investidor + assinatura
 * ativa e não recebeu análise nas últimas 20h.
 */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { data: profiles, error } = await admin
      .from("profiles")
      .select("id, plan, plan_expires_at, display_currency, investor_profile")
      .not("investor_profile", "is", null)
      .neq("plan", "free");
    if (error) return NextResponse.json({ error: safeError("cron.advice", error) }, { status: 500 });

    const cutoff = new Date(Date.now() - 20 * 3600 * 1000).toISOString();
    let generated = 0;

    for (const p of profiles ?? []) {
      if (!hasActiveAccess(p)) continue;

      const { data: last } = await admin
        .from("investment_advice")
        .select("created_at")
        .eq("user_id", p.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (last && last.created_at > cutoff) continue;

      const { data: hasInv } = await admin
        .from("investments")
        .select("id")
        .eq("user_id", p.id)
        .limit(1)
        .maybeSingle();
      if (!hasInv) continue; // carteira vazia, nada a analisar

      const r = await buildAndStoreAdvice(
        p.id,
        p.investor_profile!,
        p.display_currency,
        admin,
      );
      if (r.inserted) generated++;
    }

    logger.info("cron.advice.done", { candidates: profiles?.length ?? 0, generated });
    return NextResponse.json({ ok: true, generated });
  } catch (err) {
    return NextResponse.json({ error: safeError("cron.advice", err) }, { status: 500 });
  }
}
