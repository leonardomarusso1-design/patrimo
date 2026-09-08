"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { safeError } from "@/lib/logger";

export async function resolveSupport(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  try {
    await requireAdmin();
    await createAdminClient()
      .from("support_messages")
      .update({ status: "done" })
      .eq("id", id);
    revalidatePath("/admin/suporte");
  } catch (err) {
    safeError("admin.support.resolve", err);
  }
}

export type ReplyState = { error?: string; ok?: boolean; emailSent?: boolean };

/**
 * Responde uma mensagem: grava a resposta e tenta enviar por e-mail (Resend).
 * Sem RESEND_API_KEY / domínio, o e-mail vira no-op — a resposta fica gravada
 * pra você copiar. `emailSent` diz se saiu de fato.
 */
export async function replySupport(_prev: ReplyState, fd: FormData): Promise<ReplyState> {
  const p = z
    .object({ id: z.string().uuid(), text: z.string().trim().min(2).max(4000) })
    .safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "Escreva a resposta." };

  try {
    await requireAdmin();
    const db = createAdminClient();
    const { data: msg } = await db
      .from("support_messages")
      .select("email, name, message")
      .eq("id", p.data.id)
      .maybeSingle();
    if (!msg) return { error: "Mensagem não encontrada." };

    await db
      .from("support_messages")
      .update({ admin_reply: p.data.text, replied_at: new Date().toISOString(), status: "done" })
      .eq("id", p.data.id);

    const sent = await sendEmail({
      to: msg.email,
      subject: "Resposta do suporte — Ordre",
      html: `<div style="font-family:system-ui,sans-serif;max-width:520px;color:#14211c">
        <p>Olá, ${msg.name.replace(/</g, "&lt;")}.</p>
        <p style="white-space:pre-wrap">${p.data.text.replace(/</g, "&lt;")}</p>
        <hr style="border:none;border-top:1px solid #e4e8e2;margin:16px 0">
        <p style="font-size:12px;color:#5b6660">Você escreveu: ${msg.message.slice(0, 300).replace(/</g, "&lt;")}</p>
        <p style="font-size:12px;color:#5b6660">Ordre · Leonardo Marusso</p>
      </div>`,
    });

    revalidatePath("/admin/suporte");
    return { ok: true, emailSent: sent };
  } catch (err) {
    return { error: safeError("admin.support.reply", err) };
  }
}
