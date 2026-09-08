import "server-only";

import { logger } from "@/lib/logger";

export type ChatMsg = { role: "user" | "assistant"; content: string };

export type FinanceSnapshot = {
  currency: string;
  month: string;
  income: number;
  fixed: number;
  variable: number;
  balance: number;
  reserve: number;
  goals: { name: string; target: number; saved: number }[];
  debtsRemaining: number;
  netWorth: number | null;
};

const SYSTEM = `Você é o assistente de finanças pessoais do app Ordre.
Regras:
- Fale português do Brasil, tom direto, prático e acolhedor. Sem jargão desnecessário.
- Use os números do usuário (fornecidos em JSON) para respostas concretas.
- NÃO recomende ativos específicos por nome/ticker para comprar nem faça previsão de mercado.
- Não é consultoria financeira registrada; a decisão final é do usuário.
- Respostas curtas: no máximo ~120 palavras, em texto simples (pode usar listas com "- ").
- Se perguntarem algo fora de finanças pessoais, redirecione gentilmente.`;

const UNAVAILABLE =
  "O assistente está indisponível no momento. Tente novamente mais tarde.";

export async function askFinanceCoach(
  snapshot: FinanceSnapshot,
  history: ChatMsg[],
): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return UNAVAILABLE;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.5,
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "system", content: `Dados do usuário: ${JSON.stringify(snapshot)}` },
          ...history.slice(-10),
        ],
      }),
    });
    if (!res.ok) throw new Error(`openai ${res.status}`);
    const json = await res.json();
    const text = String(json.choices?.[0]?.message?.content ?? "").trim();
    return text.slice(0, 1500) || UNAVAILABLE;
  } catch (err) {
    logger.warn("ai.chat.fail", {
      error: err instanceof Error ? err.message : String(err),
    });
    return UNAVAILABLE;
  }
}
