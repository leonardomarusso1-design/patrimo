import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting serverless-native (Upstash). Prioridade: endpoints de auth,
 * webhook de pagamento, tracking de analytics.
 * Em produção, falhas de configuração/rede bloqueiam por segurança; em desenvolvimento, o limite é desativado explicitamente.
 */

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const limiters = new Map<string, Ratelimit>();

function limiter(name: string, tokens: number, window: `${number} ${"s" | "m" | "h"}`) {
  if (!redis) return null;
  const key = `${name}:${tokens}:${window}`;
  if (!limiters.has(key)) {
    limiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(tokens, window),
        prefix: `ordre:rl:${name}`,
        analytics: false,
      }),
    );
  }
  return limiters.get(key)!;
}

type HeaderGetter = { get(name: string): string | null };

export function getClientIp(req: Request): string {
  return ipFromHeaders(req.headers);
}

/** Mesmo cálculo, a partir de um objeto de headers (ex.: next/headers). */
export function ipFromHeaders(h: HeaderGetter): string {
  // Na Vercel, x-forwarded-for é controlado pelo cliente (a plataforma só
  // APPENDA o IP real). Usar o header próprio da Vercel ou o último hop.
  const vercel = h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim());
    return parts[parts.length - 1] || "0.0.0.0";
  }
  return h.get("x-real-ip") || "0.0.0.0";
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

export async function checkRateLimit(
  bucket: "auth" | "webhook" | "analytics" | "ai" | "default",
  identifier: string,
): Promise<RateLimitResult> {
  const config: Record<string, { tokens: number; window: `${number} ${"s" | "m" | "h"}` }> = {
    auth: { tokens: 8, window: "1 m" },
    webhook: { tokens: 60, window: "1 m" },
    analytics: { tokens: 40, window: "1 m" },
    ai: { tokens: 20, window: "1 h" },
    default: { tokens: 30, window: "1 m" },
  };
  const c = config[bucket] ?? config.default;
  const rl = limiter(bucket, c.tokens, c.window);
  if (!rl) {
    if (process.env.NODE_ENV === "production") {
      console.error("rate-limit: Upstash não configurado em produção — fail-closed", { bucket });
      return { ok: false, retryAfter: 60 };
    }
    return { ok: true };
  }

  try {
    const res = await rl.limit(identifier);
    if (res.success) return { ok: true };
    return { ok: false, retryAfter: Math.ceil((res.reset - Date.now()) / 1000) };
  } catch (err) {
    // Em produção, não liberar operações sensíveis quando o limitador está indisponível.
    console.error("rate-limit: falha no Upstash — fail-closed", {
      bucket,
      error: err instanceof Error ? err.message : String(err),
    });
    return process.env.NODE_ENV === "production"
      ? { ok: false, retryAfter: 60 }
      : { ok: true };
  }
}
