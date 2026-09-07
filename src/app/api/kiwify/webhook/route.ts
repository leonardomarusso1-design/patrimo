import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient, findUserIdByEmail } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logger, safeError } from "@/lib/logger";
import { PLAN } from "@/lib/plans";
import { sendEmail, accessGrantedEmail } from "@/lib/email";

/**
 * Webhook da Kiwify. Assinatura: HMAC-SHA1 do corpo cru com KIWIFY_WEBHOOK_SECRET,
 * enviada em ?signature=. Compra aprovada/renovada libera o acesso por 1 ano;
 * reembolso/cancelamento/chargeback revoga.
 */

const GRANT = new Set([
  "order_approved",
  "order_paid",
  "subscription_renewed",
  "subscription_approved",
  "pix_paid",
  "billet_paid",
]);
const REVOKE = new Set([
  "order_refunded",
  "order_chargedback",
  "subscription_canceled",
  "subscription_late",
  "chargeback",
  "refunded",
]);

function verify(rawBody: string, signature: string | null): boolean {
  const secret = process.env.KIWIFY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha1", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

type Payload = {
  webhook_event_type?: string;
  order_status?: string;
  order_id?: string;
  Customer?: { email?: string; full_name?: string };
  customer?: { email?: string; full_name?: string };
  Subscription?: { status?: string };
};

function extractEmail(p: Payload): string | null {
  return (p.Customer?.email ?? p.customer?.email ?? "").trim().toLowerCase() || null;
}

function classify(p: Payload): "grant" | "revoke" | "ignore" {
  const evt = (p.webhook_event_type ?? "").toLowerCase();
  const status = (p.order_status ?? "").toLowerCase();
  if (GRANT.has(evt) || status === "paid" || status === "approved") return "grant";
  if (REVOKE.has(evt) || ["refunded", "chargedback", "canceled"].includes(status))
    return "revoke";
  return "ignore";
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit("webhook", ip);
    if (!rl.ok) return NextResponse.json({ error: "rate limited" }, { status: 429 });

    const rawBody = await req.text();
    const signature = new URL(req.url).searchParams.get("signature");
    if (!verify(rawBody, signature)) {
      logger.warn("kiwify.webhook.bad_signature", { ip });
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    let payload: Payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "invalid json" }, { status: 400 });
    }

    const action = classify(payload);
    const email = extractEmail(payload);
    if (action === "ignore" || !email) {
      return NextResponse.json({ ok: true, action: "ignored" });
    }

    const admin = createAdminClient();
    const userId = await findUserIdByEmail(email);
    const ref = payload.order_id ?? null;

    if (action === "grant") {
      const expiresAt = new Date(
        Date.now() + 366 * 24 * 60 * 60 * 1000,
      ).toISOString();

      if (userId) {
        await admin
          .from("profiles")
          .update({ plan: PLAN.id, plan_expires_at: expiresAt, renewal_reminded_at: null })
          .eq("id", userId);
        await admin.from("subscriptions").upsert(
          {
            user_id: userId,
            plan: PLAN.id,
            status: "active",
            provider: "kiwify",
            provider_ref: ref,
            current_period_end: expiresAt,
          },
          { onConflict: "user_id" },
        );
      } else {
        await admin.from("pending_purchases").upsert(
          { email, plan: PLAN.id, expires_at: expiresAt, provider_ref: ref },
          { onConflict: "email" },
        );
      }
      await sendEmail(accessGrantedEmail(email));
      logger.info("kiwify.webhook.grant", { email: mask(email), hasUser: !!userId });
      return NextResponse.json({ ok: true, action: "granted" });
    }

    // revoke
    if (userId) {
      await admin
        .from("profiles")
        .update({ plan: "free", plan_expires_at: new Date().toISOString() })
        .eq("id", userId);
      await admin
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("user_id", userId);
    }
    await admin.from("pending_purchases").delete().eq("email", email);
    logger.info("kiwify.webhook.revoke", { email: mask(email), hasUser: !!userId });
    return NextResponse.json({ ok: true, action: "revoked" });
  } catch (err) {
    return NextResponse.json({ error: safeError("kiwify.webhook", err) }, { status: 500 });
  }
}

function mask(email: string) {
  const [u, d] = email.split("@");
  return `${u.slice(0, 2)}***@${d ?? ""}`;
}

export function GET() {
  return NextResponse.json({ ok: true, hint: "POST only" }, { status: 405 });
}
