import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { botEnabled } from "@/lib/whatsapp/config";
import { runWhatsappDigests } from "@/lib/whatsapp/run-digests";
import { safeError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** 11:00 UTC = 8:00 em Brasília. Não envia nada enquanto o bot estiver desligado. */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!botEnabled()) return NextResponse.json({ ok: true, skipped: true });
  try {
    const result = await runWhatsappDigests();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: safeError("whatsapp.digest", err) }, { status: 500 });
  }
}
