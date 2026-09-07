import { NextResponse } from "next/server";
import { requireUser } from "@/lib/data";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const BASE = "https://parallelum.com.br/fipe/api/v1/carros";

/**
 * Proxy da API FIPE (parallelum). Mantém a CSP fechada e não expõe o cliente
 * direto ao terceiro. Só usuário logado, com rate limit.
 * ?step=marcas | modelos&marca= | anos&marca=&modelo= | valor&marca=&modelo=&ano=
 */
export async function GET(req: Request) {
  await requireUser();
  const rl = await checkRateLimit("default", getClientIp(req));
  if (!rl.ok) return NextResponse.json({ error: "rate limited" }, { status: 429 });

  const p = new URL(req.url).searchParams;
  const step = p.get("step");
  const marca = p.get("marca");
  const modelo = p.get("modelo");
  const ano = p.get("ano");

  let url: string | null = null;
  if (step === "marcas") url = `${BASE}/marcas`;
  else if (step === "modelos" && marca) url = `${BASE}/marcas/${marca}/modelos`;
  else if (step === "anos" && marca && modelo)
    url = `${BASE}/marcas/${marca}/modelos/${modelo}/anos`;
  else if (step === "valor" && marca && modelo && ano)
    url = `${BASE}/marcas/${marca}/modelos/${modelo}/anos/${ano}`;

  if (!url) return NextResponse.json({ error: "parâmetros inválidos" }, { status: 400 });

  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) throw new Error(`FIPE ${res.status}`);
    return NextResponse.json(await res.json());
  } catch (err) {
    logger.error("fipe.proxy", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "FIPE indisponível agora." }, { status: 502 });
  }
}
