import "server-only";

import type { InvestorProfile } from "@/types/database";
import { PROFILE_INFO } from "@/lib/investor";
import { logger } from "@/lib/logger";

export type Advice = { summary: string; actions: string[]; model: string };

type PortfolioInput = {
  profile: InvestorProfile;
  currency: string;
  total: number;
  variablePct: number;
  byClass: { name: string; value: number }[];
};

const SYSTEM = `Você é um assistente de alocação de carteira do app Patrimo.
Regras:
- NÃO faça previsões de curto prazo nem recomende ativos específicos por nome/ticker para comprar.
- Baseie-se em princípios de alocação, no perfil do investidor e na composição atual.
- Fale em português do Brasil, tom direto e prático, sem jargão desnecessário.
- Deixe claro que a decisão final é do usuário e que isto não é consultoria registrada.
Responda APENAS com JSON: {"summary": "2-3 frases", "actions": ["3 a 5 ações objetivas"]}.`;

function fallback(input: PortfolioInput): Advice {
  const target = PROFILE_INFO[input.profile].allocation.variavel;
  const diff = Math.round(input.variablePct - target);
  const actions: string[] = [];
  if (diff > 10)
    actions.push(
      `Sua renda variável está ~${diff}pp acima do alvo (${target}%). Direcione novos aportes para renda fixa até reequilibrar.`,
    );
  else if (diff < -10)
    actions.push(
      `Sua renda variável está ~${Math.abs(diff)}pp abaixo do alvo (${target}%). Há espaço para aumentar exposição gradualmente.`,
    );
  else actions.push(`Sua alocação está dentro do alvo do perfil ${PROFILE_INFO[input.profile].label}. Mantenha os aportes regulares.`);
  actions.push("Garanta a reserva de emergência completa antes de aumentar risco.");
  actions.push("Aporte com regularidade (custo médio) em vez de tentar acertar o momento.");
  actions.push("Revise a carteira a cada 3 meses e rebalanceie se algum ativo passar de 20% do total.");
  return {
    summary: `Perfil ${PROFILE_INFO[input.profile].label}: ${PROFILE_INFO[input.profile].blurb} Sua carteira tem ${Math.round(
      input.variablePct,
    )}% em renda variável (alvo ~${target}%).`,
    actions,
    model: "regras-patrimo",
  };
}

export async function generateAdvice(input: PortfolioInput): Promise<Advice> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return fallback(input);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: JSON.stringify({
              perfil: PROFILE_INFO[input.profile].label,
              alvo_renda_variavel_pct: PROFILE_INFO[input.profile].allocation.variavel,
              carteira_total: input.total,
              moeda: input.currency,
              renda_variavel_pct_atual: Math.round(input.variablePct),
              composicao_por_classe: input.byClass,
            }),
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`openai ${res.status}`);
    const json = await res.json();
    const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}");
    if (!parsed.summary || !Array.isArray(parsed.actions)) throw new Error("bad shape");
    return {
      summary: String(parsed.summary).slice(0, 800),
      actions: parsed.actions.slice(0, 6).map((a: unknown) => String(a).slice(0, 300)),
      model: "gpt-4o-mini",
    };
  } catch (err) {
    logger.warn("ai.advice.fallback", {
      error: err instanceof Error ? err.message : String(err),
    });
    return fallback(input);
  }
}
