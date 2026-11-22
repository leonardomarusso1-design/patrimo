import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * X-Hub-Signature-256: sha256=<hex> do corpo cru com o App Secret da Meta.
 * Comparação em tempo constante. Sem segredo ou sem cabeçalho, recusa.
 */
export function verifyMetaSignature(
  rawBody: string,
  header: string | null,
  appSecret: string | null,
): boolean {
  if (!appSecret || !header) return false;
  const match = header.match(/^sha256=([a-f0-9]{64})$/i);
  if (!match) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(match[1], "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
