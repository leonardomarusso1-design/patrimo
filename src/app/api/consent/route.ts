import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hashIp } from "@/lib/utils";
import { safeError } from "@/lib/logger";

const schema = z.object({
  necessary: z.literal(true),
  analytics: z.boolean(),
  marketing: z.boolean(),
  at: z.string(),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit("analytics", ip);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Muitas requisições." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    const body = schema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("cookie_consents").insert({
      user_id: user?.id ?? null,
      necessary: true,
      analytics: body.data.analytics,
      marketing: body.data.marketing,
      ip_hash: await hashIp(ip),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: safeError("consent.post", err) }, { status: 500 });
  }
}
