import { displayNumber } from "./config";

export type Inbound = {
  waId: string;
  from: string;
  type: "text" | "image" | "interactive" | "other";
  text: string | null;
  buttonId: string | null;
  mediaId: string | null;
  mime: string | null;
};

/**
 * Lê só o que o webhook precisa. Não registra o corpo: ele traz telefone e texto.
 * Ignora status (entregue/lido), grupo e mensagem enviada pelo próprio número.
 */
export function collectInbound(payload: unknown): Inbound[] {
  if (!payload || typeof payload !== "object") return [];
  const entries = (payload as { entry?: unknown }).entry;
  if (!Array.isArray(entries)) return [];
  const own = displayNumber();
  const out: Inbound[] = [];
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const changes = (entry as { changes?: unknown }).changes;
    if (!Array.isArray(changes)) continue;
    for (const change of changes) {
      if (!change || typeof change !== "object") continue;
      const value = (change as { value?: { messages?: unknown } }).value;
      const messages = value?.messages;
      if (!Array.isArray(messages)) continue;
      for (const raw of messages) {
        const msg = normalize(raw, own);
        if (msg) out.push(msg);
      }
    }
  }
  return out;
}

function normalize(raw: unknown, own: string | null): Inbound | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  if (typeof m.group_id === "string") return null;
  if (typeof m.from !== "string" || typeof m.id !== "string") return null;
  const from = m.from.replace(/\D/g, "");
  if (!from || (own && from === own)) return null;

  if (m.type === "text") {
    const body = (m.text as { body?: unknown } | undefined)?.body;
    return base(m.id, from, "text", typeof body === "string" ? body : "", null, null, null);
  }
  if (m.type === "image") {
    const image = m.image as { id?: unknown; mime_type?: unknown; caption?: unknown } | undefined;
    return base(
      m.id,
      from,
      "image",
      typeof image?.caption === "string" ? image.caption : null,
      null,
      typeof image?.id === "string" ? image.id : null,
      typeof image?.mime_type === "string" ? image.mime_type : null,
    );
  }
  if (m.type === "interactive") {
    const inter = m.interactive as {
      button_reply?: { id?: unknown; title?: unknown };
      list_reply?: { id?: unknown; title?: unknown };
    };
    const reply = inter?.button_reply ?? inter?.list_reply;
    const id = typeof reply?.id === "string" ? reply.id : null;
    const title = typeof reply?.title === "string" ? reply.title : null;
    return base(m.id, from, "interactive", title, id, null, null);
  }
  if (m.type === "button") {
    const button = m.button as { payload?: unknown; text?: unknown } | undefined;
    const id = typeof button?.payload === "string" ? button.payload : null;
    const title = typeof button?.text === "string" ? button.text : null;
    return base(m.id, from, "interactive", title, id, null, null);
  }
  return base(m.id, from, "other", null, null, null, null);
}

function base(
  waId: string,
  from: string,
  type: Inbound["type"],
  text: string | null,
  buttonId: string | null,
  mediaId: string | null,
  mime: string | null,
): Inbound {
  return { waId, from, type, text, buttonId, mediaId, mime };
}
