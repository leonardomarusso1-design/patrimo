import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { botEnabled } from "@/lib/whatsapp/config";
import { handleInbound } from "@/lib/whatsapp/handle";
import { collectInbound } from "@/lib/whatsapp/payload";
import { verifyMetaSignature } from "@/lib/whatsapp/signature";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logger, safeError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cloud API da Meta.
 * GET: verificação do webhook (hub.challenge), mesmo com o bot desligado,
 * para o dono conseguir cadastrar a URL antes de ligar a flag.
 * POST: sem assinatura válida, 401. Com a flag desligada, 200 e não processa.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_VERIFY_TOKEN?.trim() ?? "";
  if (!expected || mode !== "subscribe" || !token || challenge == null) {
    return new Response("forbidden", { status: 403 });
  }
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    logger.warn("whatsapp.webhook.bad_verify");
    return new Response("forbidden", { status: 403 });
  }
  return new Response(challenge, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.WHATSAPP_APP_SECRET?.trim() || null;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 404 });

  if (!verifyMetaSignature(raw, req.headers.get("x-hub-signature-256"), secret)) {
    logger.warn("whatsapp.webhook.bad_signature");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  if (!botEnabled()) return NextResponse.json({ ok: true, ignored: true });

  const rl = await checkRateLimit("whatsapp", getClientIp(req));
  if (!rl.ok) return NextResponse.json({ ok: true, dropped: true });

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    for (const msg of collectInbound(payload)) {
      await handleInbound(msg);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: safeError("whatsapp.webhook", err) }, { status: 500 });
  }
}
