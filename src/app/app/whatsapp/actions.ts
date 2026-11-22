"use server";

import { revalidatePath } from "next/cache";
import { requirePaidUser } from "@/lib/data";
import { safeError } from "@/lib/logger";
import { botEnabled, displayNumber, phonePepper, whatsappConfigured } from "@/lib/whatsapp/config";
import { disconnectUser, issueVerifyCode, purgeHistory, savePrefs } from "@/lib/whatsapp/store";

export type WaState = { error?: string; ok?: string; code?: string; waUrl?: string | null };

function off(): WaState {
  return { error: "O WhatsApp do Ordre ainda não está ligado." };
}

export async function generateWhatsappCode(prev: WaState, form: FormData): Promise<WaState> {
  void prev;
  void form;
  if (!botEnabled()) return off();
  const pepper = phonePepper();
  if (!pepper || !whatsappConfigured()) return { error: "Não foi possível gerar o código agora." };
  try {
    const { user } = await requirePaidUser();
    const code = await issueVerifyCode(user.id, pepper);
    if (!code) return { error: "Não foi possível gerar o código agora." };
    const number = displayNumber();
    const waUrl = number
      ? `https://wa.me/${number}?text=${encodeURIComponent(`ORDRE-${code}`)}`
      : null;
    revalidatePath("/app/whatsapp");
    return { code: `ORDRE-${code}`, waUrl };
  } catch (err) {
    return { error: safeError("whatsapp.code", err) };
  }
}

export async function updateWhatsappPrefs(_prev: WaState, form: FormData): Promise<WaState> {
  if (!botEnabled()) return off();
  try {
    const { user } = await requirePaidUser();
    await savePrefs(user.id, {
      alerts: form.get("alerts") === "on",
      daily: form.get("daily") === "on",
      weekly: form.get("weekly") === "on",
      monthly: form.get("monthly") === "on",
    });
    revalidatePath("/app/whatsapp");
    return { ok: "Preferências salvas." };
  } catch (err) {
    return { error: safeError("whatsapp.prefs", err) };
  }
}

export async function disconnectWhatsapp(_prev: WaState, form: FormData): Promise<WaState> {
  if (form.get("confirm") !== "on") return { error: "Marque a confirmação para desconectar." };
  try {
    const { user } = await requirePaidUser();
    await disconnectUser(user.id);
    revalidatePath("/app/whatsapp");
    return { ok: "Número desconectado. Os lançamentos no painel continuam." };
  } catch (err) {
    return { error: safeError("whatsapp.disconnect", err) };
  }
}

export async function purgeWhatsappHistory(_prev: WaState, form: FormData): Promise<WaState> {
  if (form.get("confirm_purge") !== "on") {
    return { error: "Marque a confirmação para apagar o histórico do bot." };
  }
  try {
    const { user } = await requirePaidUser();
    await purgeHistory(user.id);
    revalidatePath("/app/whatsapp");
    return { ok: "Histórico do bot apagado. Os lançamentos do orçamento não foram mexidos." };
  } catch (err) {
    return { error: safeError("whatsapp.purge", err) };
  }
}
