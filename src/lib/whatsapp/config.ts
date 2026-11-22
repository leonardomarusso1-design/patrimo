/**
 * Tudo do bot lê daqui. A flag só liga com o valor exato "true".
 * Ausente ou qualquer outro valor = desligado.
 */

type Env = Record<string, string | undefined>;

export function botEnabled(env: Env = process.env): boolean {
  return env.WHATSAPP_BOT_ENABLED === "true";
}

export function readQuota(env: Env = process.env): number {
  const n = Number(env.WHATSAPP_MONTHLY_QUOTA ?? "80");
  if (!Number.isFinite(n) || n < 1) return 80;
  return Math.min(Math.floor(n), 10_000);
}

export function readPackSize(env: Env = process.env): number {
  const n = Number(env.WHATSAPP_PACK_MESSAGES ?? "100");
  if (!Number.isFinite(n) || n < 1) return 100;
  return Math.min(Math.floor(n), 10_000);
}

const KIWIFY_HOSTS = new Set(["pay.kiwify.com.br", "kiwify.app", "checkout.kiwify.com.br"]);

/** Só aceita link https da Kiwify. Produto ainda pode não existir. */
export function packCheckoutUrl(env: Env = process.env): string | null {
  const raw = env.WHATSAPP_PACK_CHECKOUT_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (!KIWIFY_HOSTS.has(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function packProductId(env: Env = process.env): string | null {
  const id = env.KIWIFY_WHATSAPP_PACK_PRODUCT_ID?.trim();
  return id || null;
}

export function graphVersion(env: Env = process.env): string {
  const v = env.WHATSAPP_GRAPH_VERSION?.trim();
  return v && /^v\d+\.\d+$/.test(v) ? v : "v22.0";
}

export function displayNumber(env: Env = process.env): string | null {
  const digits = (env.WHATSAPP_DISPLAY_NUMBER ?? "").replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

export function phonePepper(env: Env = process.env): string | null {
  const p = env.WHATSAPP_PHONE_PEPPER?.trim();
  return p || null;
}

export function whatsappConfigured(env: Env = process.env): boolean {
  return Boolean(
    env.WHATSAPP_ACCESS_TOKEN?.trim() &&
      env.WHATSAPP_PHONE_NUMBER_ID?.trim() &&
      env.WHATSAPP_APP_SECRET?.trim() &&
      phonePepper(env),
  );
}

export function siteUrl(env: Env = process.env): string {
  const raw = env.NEXT_PUBLIC_SITE_URL?.trim() || "https://ordre.toqy.com.br";
  return raw.replace(/\/$/, "");
}

export const AUTO_SAVE_CONFIDENCE = 0.8;

export const LIMITS = {
  perMinute: 12,
  unlinkedPerHour: 5,
  codeFailsPer15Min: 8,
  messageRetentionDays: 30,
};
