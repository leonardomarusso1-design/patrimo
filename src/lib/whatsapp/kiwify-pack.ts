/** Identifica o produto avulso do WhatsApp no webhook da Kiwify. */

export function extractKiwifyProductId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const product = p.Product ?? p.product;
  const fromObj = (obj: unknown): string | null => {
    if (!obj || typeof obj !== "object") return null;
    const o = obj as Record<string, unknown>;
    const id = o.product_id ?? o.id;
    if (typeof id === "string" && id.trim()) return id.trim();
    if (typeof id === "number") return String(id);
    return null;
  };
  if (Array.isArray(product)) {
    for (const item of product) {
      const id = fromObj(item);
      if (id) return id;
    }
  }
  return fromObj(product) ?? (typeof p.product_id === "string" ? p.product_id.trim() : null);
}

export function isWhatsappPack(payload: unknown, configuredId: string | null): boolean {
  if (!configuredId) return false;
  const id = extractKiwifyProductId(payload);
  return Boolean(id && id === configuredId);
}
