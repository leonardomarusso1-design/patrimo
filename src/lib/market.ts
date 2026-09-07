import "server-only";

/**
 * Dados de mercado pras calculadoras. Tudo server-side + cache — nada bate
 * em API externa do browser. Se a fonte cai, devolve um fallback razoável.
 */

/** CDI ao ano (%) — série 4389 do Banco Central. Cache 12h. */
export async function getCdiAnnual(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/1?formato=json",
      { next: { revalidate: 60 * 60 * 12 } },
    );
    if (!res.ok) throw new Error(`bcb ${res.status}`);
    const json = (await res.json()) as { valor?: string }[];
    const v = Number(json?.[0]?.valor);
    return Number.isFinite(v) && v > 0 ? v : 10.65;
  } catch {
    return 10.65;
  }
}

export type CryptoId = "bitcoin" | "ethereum" | "solana" | "tether" | "binancecoin";
export const CRYPTOS: { id: CryptoId; symbol: string; name: string }[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "tether", symbol: "USDT", name: "Tether" },
];

/** Preço de cada cripto em BRL e USD. Cache 5min. `{}` se a fonte falhar. */
export async function getCryptoPrices(): Promise<
  Record<string, { brl: number; usd: number }>
> {
  try {
    const ids = CRYPTOS.map((c) => c.id).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=brl,usd`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) throw new Error(`coingecko ${res.status}`);
    return (await res.json()) as Record<string, { brl: number; usd: number }>;
  } catch {
    return {};
  }
}
