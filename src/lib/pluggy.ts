import "server-only";

import { logger } from "@/lib/logger";

const BASE = "https://api.pluggy.ai";

export function pluggyConfigured() {
  return !!(process.env.PLUGGY_CLIENT_ID && process.env.PLUGGY_CLIENT_SECRET);
}

let apiKeyCache: { key: string; exp: number } | null = null;
let apiKeyRequest: Promise<string> | null = null;
const REQUEST_TIMEOUT_MS = 15_000;

function withTimeout(signal?: AbortSignal) {
  return AbortSignal.any([signal ?? new AbortController().signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);
}

async function getApiKey(): Promise<string> {
  if (apiKeyCache && apiKeyCache.exp > Date.now()) return apiKeyCache.key;
  if (apiKeyRequest) return apiKeyRequest;
  apiKeyRequest = (async () => {
  const res = await fetch(`${BASE}/auth`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      clientId: process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET,
    }),
    signal: withTimeout(),
  });
  if (!res.ok) throw new Error(`pluggy auth ${res.status}`);
  const json = (await res.json()) as { apiKey: string };
  apiKeyCache = { key: json.apiKey, exp: Date.now() + 100 * 60 * 1000 }; // ~1h40
  return json.apiKey;
  })();
  try { return await apiKeyRequest; } finally { apiKeyRequest = null; }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const key = await getApiKey();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    signal: withTimeout(init?.signal ?? undefined),
    headers: { "X-API-KEY": key, "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error("pluggy.api", { path, status: res.status, body: body.slice(0, 300) });
    throw new Error(`pluggy ${path} ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Token de curta duração usado pelo widget Pluggy Connect no frontend. */
export async function createConnectToken(itemId?: string): Promise<string> {
  const body: Record<string, unknown> = {};
  if (itemId) body.itemId = itemId;
  const json = await api<{ accessToken: string }>("/connect_token", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return json.accessToken;
}

export type PluggyItem = {
  id: string;
  status: string;
  connector: { name: string; institutionUrl?: string };
};
export type PluggyAccount = { id: string; type: string; name: string; currencyCode: string };
export type PluggyTransaction = {
  id: string;
  description: string;
  amount: number; // negativo = saída
  date: string; // ISO
  category?: string | null;
  currencyCode: string;
};

export async function getItem(itemId: string) {
  return api<PluggyItem>(`/items/${itemId}`);
}

export async function listAccounts(itemId: string) {
  const json = await api<{ results: PluggyAccount[] }>(`/accounts?itemId=${itemId}`);
  return json.results;
}

export async function listTransactions(accountId: string, fromISO: string) {
  const key = await getApiKey();
  const all: PluggyTransaction[] = [];
  let url: string | null = `${BASE}/v2/transactions?accountId=${accountId}`;

  for (let i = 0; url && i < 30; i++) {
    const res = await fetch(url, { headers: { "X-API-KEY": key }, signal: withTimeout() });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logger.error("pluggy.transactions", { status: res.status, body: body.slice(0, 300) });
      break;
    }
    const json = (await res.json()) as {
      results: PluggyTransaction[];
      next: string | null;
    };
    for (const t of json.results) {
      // v2 vem ordenado por data desc; para de paginar ao passar do período
      if (t.date.slice(0, 10) < fromISO) return all;
      all.push(t);
    }
    url = json.next;
  }
  return all;
}

export async function deleteItem(itemId: string) {
  try {
    await api(`/items/${itemId}`, { method: "DELETE" });
  } catch (err) {
    logger.warn("pluggy.deleteItem", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
