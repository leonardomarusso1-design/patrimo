import "server-only";
import { timingSafeEqual } from "node:crypto";

/** Valida a chamada do Vercel Cron (Authorization: Bearer $CRON_SECRET). */
export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const got = req.headers.get("authorization") ?? "";
  const want = `Bearer ${secret}`;
  const a = Buffer.from(got);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}
