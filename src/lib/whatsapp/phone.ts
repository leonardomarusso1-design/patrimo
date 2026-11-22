import { createCipheriv, createDecipheriv, createHmac, randomBytes, createHash } from "node:crypto";

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function maskPhone(raw: string): string {
  const d = normalizePhone(raw);
  if (d.length < 4) return "••••";
  return `+${d.slice(0, 2)} •••• ${d.slice(-4)}`;
}

export function hashPhone(raw: string, pepper: string): string {
  return createHmac("sha256", pepper).update(`phone:${normalizePhone(raw)}`).digest("hex");
}

export function hashCode(code: string, pepper: string): string {
  return createHmac("sha256", pepper).update(`code:${code}`).digest("hex");
}

function encKey(pepper: string): Buffer {
  return createHash("sha256").update(`enc:${pepper}`).digest();
}

/** AES-256-GCM. O número em claro só existe na hora de responder. */
export function encryptPhone(raw: string, pepper: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(pepper), iv);
  const ct = Buffer.concat([cipher.update(normalizePhone(raw), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${ct.toString("base64")}`;
}

export function decryptPhone(payload: string, pepper: string): string | null {
  const [ivB, tagB, ctB] = payload.split(".");
  if (!ivB || !tagB || !ctB) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", encKey(pepper), Buffer.from(ivB, "base64"));
    decipher.setAuthTag(Buffer.from(tagB, "base64"));
    const plain = Buffer.concat([
      decipher.update(Buffer.from(ctB, "base64")),
      decipher.final(),
    ]);
    return plain.toString("utf8");
  } catch {
    return null;
  }
}
