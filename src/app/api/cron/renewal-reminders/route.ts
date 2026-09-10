import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, renewalReminderEmail } from "@/lib/email";
import { isTrial } from "@/lib/plans";
import { logger, safeError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Diário: avisa quem tem assinatura expirando em ~7 dias e ainda não foi avisado
 * neste ciclo. `renewal_reminded_at` é limpo quando o webhook renova o plano.
 */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const now = Date.now();
    const in8d = new Date(now + 8 * 86400000).toISOString();

    const { data: profiles, error } = await admin
      .from("profiles")
      .select("id, email, full_name, plan, plan_expires_at, trial_started_at, renewal_reminded_at")
      .neq("plan", "free")
      .not("plan_expires_at", "is", null)
      .lt("plan_expires_at", in8d)
      .gt("plan_expires_at", new Date(now).toISOString());
    if (error) return NextResponse.json({ error: safeError("cron.renewal", error) }, { status: 500 });

    let sent = 0;
    for (const p of profiles ?? []) {
      const expiresMs = new Date(p.plan_expires_at!).getTime();
      const daysLeft = Math.max(Math.ceil((expiresMs - now) / 86400000), 1);
      const trial = isTrial(p);
      // teste grátis: só avisa nos 2 últimos dias (senão avisaria já no dia 1).
      if (trial && daysLeft > 2) continue;
      // já avisado neste ciclo? pula.
      if (p.renewal_reminded_at && new Date(p.renewal_reminded_at).getTime() > now - 20 * 86400000) {
        continue;
      }
      if (!p.email) continue;

      await sendEmail(
        renewalReminderEmail(
          p.email,
          (p.full_name ?? "").split(" ")[0] || "tudo certo",
          daysLeft,
          trial,
        ),
      );
      await admin
        .from("profiles")
        .update({ renewal_reminded_at: new Date().toISOString() })
        .eq("id", p.id);
      sent++;
    }

    logger.info("cron.renewal.done", { candidates: profiles?.length ?? 0, sent });
    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    return NextResponse.json({ error: safeError("cron.renewal", err) }, { status: 500 });
  }
}
