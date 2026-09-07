import "server-only";

/** Valida a chamada do Vercel Cron (Authorization: Bearer $CRON_SECRET). */
export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}
