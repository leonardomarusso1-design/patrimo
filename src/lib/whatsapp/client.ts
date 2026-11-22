import "server-only";

import { logger } from "@/lib/logger";
import { graphVersion, whatsappConfigured } from "./config";
import { templateParam } from "./text";

const MAX_IMAGE = 4_500_000;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function endpoint(): string | null {
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  if (!id || !token || !whatsappConfigured()) return null;
  return `https://graph.facebook.com/${graphVersion()}/${id}/messages`;
}

async function graph(body: unknown): Promise<string | null> {
  const url = endpoint();
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  if (!url || !token) throw new Error("whatsapp_not_configured");
  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    logger.warn("whatsapp.send_failed", { status: res.status });
    throw new Error(`whatsapp_send_${res.status}`);
  }
  const json = (await res.json()) as { messages?: { id?: string }[] };
  return json.messages?.[0]?.id ?? null;
}

export async function sendText(to: string, body: string): Promise<string | null> {
  return graph({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { preview_url: false, body: body.slice(0, 4000) },
  });
}

export async function sendButtons(
  to: string,
  body: string,
  buttons: { id: string; title: string }[],
): Promise<string | null> {
  const trimmed = buttons.slice(0, 3).map((b) => ({
    type: "reply" as const,
    reply: { id: b.id.slice(0, 256), title: b.title.slice(0, 20) },
  }));
  if (!trimmed.length) return sendText(to, body);
  return graph({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body.slice(0, 1000) },
      action: { buttons: trimmed },
    },
  });
}

export async function sendTemplate(
  to: string,
  name: string,
  params: string[],
  lang = process.env.WHATSAPP_TEMPLATE_LANG?.trim() || "pt_BR",
): Promise<string | null> {
  return graph({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name,
      language: { code: lang },
      components: [
        {
          type: "body",
          parameters: params.map((text) => ({ type: "text", text: templateParam(text) })),
        },
      ],
    },
  });
}

export async function downloadMedia(mediaId: string): Promise<{ bytes: Buffer; mime: string } | null> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  if (!token || !/^\d+$/.test(mediaId)) return null;
  const metaRes = await fetch(`https://graph.facebook.com/${graphVersion()}/${mediaId}`, {
    headers: { authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (!metaRes.ok) {
    logger.warn("whatsapp.media_meta", { status: metaRes.status });
    return null;
  }
  const meta = (await metaRes.json()) as { url?: string; mime_type?: string };
  if (!meta.url || !meta.mime_type || !ALLOWED.has(meta.mime_type)) return null;
  const fileRes = await fetch(meta.url, {
    headers: { authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(20_000),
  });
  if (!fileRes.ok) return null;
  const len = Number(fileRes.headers.get("content-length") ?? "0");
  if (len > MAX_IMAGE) return null;
  const bytes = Buffer.from(await fileRes.arrayBuffer());
  if (bytes.length > MAX_IMAGE || bytes.length < 32) return null;
  return { bytes, mime: meta.mime_type };
}
