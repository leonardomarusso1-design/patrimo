import "server-only";

import { logger } from "@/lib/logger";
import {
  botEnabled,
  displayNumber,
  packCheckoutUrl,
  phonePepper,
  readPackSize,
  readQuota,
} from "./config";
import type { PanelData } from "./panel";
import { claimPendingPacks } from "./packs";
import { readLinkPublic, readUsage } from "./store";

export async function loadPanel(userId: string, email: string): Promise<PanelData> {
  const data: PanelData = {
    enabled: botEnabled(),
    ready: false,
    linked: false,
    maskedPhone: null,
    alerts: false,
    daily: false,
    weekly: true,
    monthly: true,
    used: 0,
    bonus: 0,
    quota: readQuota(),
    packSize: readPackSize(),
    checkoutUrl: packCheckoutUrl(),
    publicNumber: displayNumber(),
  };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return data;
  try {
    await claimPendingPacks(userId, email);
    const link = await readLinkPublic(userId, phonePepper());
    if (!link) return data;
    const usage = await readUsage(userId);
    return {
      ...data,
      ready: true,
      linked: link.linked,
      maskedPhone: link.masked,
      alerts: link.alerts,
      daily: link.daily,
      weekly: link.weekly,
      monthly: link.monthly,
      used: usage.used,
      bonus: usage.bonus,
    };
  } catch (err) {
    logger.warn("whatsapp.panel", { error: err instanceof Error ? err.name : "fail" });
    return data;
  }
}
