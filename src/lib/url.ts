/**
 * Sanitiza um destino de redirect vindo de query/form (?next=).
 * Só aceita caminho interno de uma barra. Bloqueia //evil.com, /\evil.com,
 * URLs absolutas e qualquer coisa que o navegador trate como off-site.
 */
export function safeNext(next: unknown, fallback = "/app"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (next.includes("\\") || next.includes("\n") || next.includes("\r")) return fallback;
  try {
    const parsed = new URL(next, "https://ordre.invalid");
    if (parsed.origin !== "https://ordre.invalid") return fallback;
  } catch {
    return fallback;
  }
  return next;
}
