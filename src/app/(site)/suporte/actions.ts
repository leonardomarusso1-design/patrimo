"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, ipFromHeaders } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { safeError } from "@/lib/logger";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  message: z.string().trim().min(5).max(2000),
});

export type SupportState = { error?: string; ok?: boolean };

export async function sendSupport(
  _prev: SupportState,
  fd: FormData,
): Promise<SupportState> {
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: "Confira nome, e-mail e mensagem." };

  const ip = ipFromHeaders(await headers());
  const rl = await checkRateLimit("default", `support:${ip}`);
  if (!rl.ok) return { error: "Muitas mensagens seguidas. Tente mais tarde." };

  try {
    const {
      data: { user },
    } = await (await createClient()).auth.getUser();

    const { error } = await createAdminClient().from("support_messages").insert({
      user_id: user?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    });
    if (error) return { error: safeError("support.send", error) };
    return { ok: true };
  } catch (err) {
    return { error: safeError("support.send", err) };
  }
}
