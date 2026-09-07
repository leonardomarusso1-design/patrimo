/**
 * Taxas de câmbio (base BRL), cacheadas por 6h. Fonte gratuita sem chave:
 * open.er-api.com. Se indisformação falhar, cai para 1:1 (não converte).
 */
type Rates = Record<string, number>;

export async function getRates(): Promise<Rates> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/BRL", {
      next: { revalidate: 60 * 60 * 6 },
    });
    if (!res.ok) throw new Error(`fx ${res.status}`);
    const json = (await res.json()) as { result?: string; rates?: Rates };
    if (json.result !== "success" || !json.rates) throw new Error("fx bad payload");
    return json.rates; // rates[USD] = quantos USD vale 1 BRL
  } catch {
    return {};
  }
}

/**
 * Converte `amount` de `from` para `to` usando taxas base BRL.
 * rates[X] = valor de 1 BRL em X. Então:
 *   amount_em_BRL = amount / rates[from]
 *   amount_em_to  = amount_em_BRL * rates[to]
 */
export function convert(
  amount: number,
  from: string,
  to: string,
  rates: Rates,
): number {
  if (from === to) return amount;
  const rFrom = from === "BRL" ? 1 : rates[from];
  const rTo = to === "BRL" ? 1 : rates[to];
  if (!rFrom || !rTo) return amount; // sem taxa: não converte
  return (amount / rFrom) * rTo;
}
