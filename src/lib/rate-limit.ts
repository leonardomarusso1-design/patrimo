import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting serverless-native (Upstash). Prioridade: endpoints de auth,
 * webhook de pagamento, tracking de analytics.
 * Fail-open se as env vars não estiverem configuradas (dev local).
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
        prefix: `patrimo:rl:${name}`,
        analytics: false,
      }),
    );
  }
  return limiters.get(key)!;
}

export function getClientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "0.0.0.0"
  );
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
  if (!rl) return { ok: true };

  const res = await rl.limit(identifier);
  if (res.success) return { ok: true };
  return { ok: false, retryAfter: Math.ceil((res.reset - Date.now()) / 1000) };
}
