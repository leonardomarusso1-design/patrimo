import type { InvestorProfile } from "@/types/database";

export type QuizOption = { label: string; score: number };
export type QuizQuestion = { id: string; question: string; options: QuizOption[] };

/**
 * Questionário de suitability simplificado (inspirado no que a CVM exige das
 * corretoras). Score somado define o perfil.
 */
export const INVESTOR_QUIZ: QuizQuestion[] = [
  {
    id: "horizonte",
    question: "Em quanto tempo você pretende usar o dinheiro que investe?",
    options: [
      { label: "Menos de 1 ano", score: 0 },
      { label: "Entre 1 e 3 anos", score: 1 },
      { label: "Entre 3 e 5 anos", score: 2 },
      { label: "Mais de 5 anos", score: 3 },
    ],
  },
  {
    id: "reacao_queda",
    question: "Sua carteira cai 20% em um mês. O que você faz?",
    options: [
      { label: "Resgato tudo — não aguento ver caindo", score: 0 },
      { label: "Resgato uma parte para reduzir o risco", score: 1 },
      { label: "Não mexo e espero recuperar", score: 2 },
      { label: "Aproveito para investir mais", score: 3 },
    ],
  },
  {
    id: "experiencia",
    question: "Qual sua experiência com investimentos?",
    options: [
      { label: "Nenhuma — só poupança/conta", score: 0 },
      { label: "Já invisto em renda fixa (Tesouro, CDB)", score: 1 },
      { label: "Tenho fundos e alguns FIIs/ações", score: 2 },
      { label: "Opero ações, ETFs e cripto com frequência", score: 3 },
    ],
  },
  {
    id: "objetivo",
    question: "O que você mais busca ao investir?",
    options: [
      { label: "Preservar o dinheiro, sem sustos", score: 0 },
      { label: "Render um pouco acima da inflação com segurança", score: 1 },
      { label: "Crescimento no médio prazo, aceito oscilar", score: 2 },
      { label: "Máximo retorno possível, aceito perdas grandes", score: 3 },
    ],
  },
  {
    id: "reserva",
    question: "Você já tem uma reserva de emergência formada?",
    options: [
      { label: "Não", score: 0 },
      { label: "Estou montando", score: 1 },
      { label: "Sim, cobre uns 6 meses", score: 2 },
      { label: "Sim, cobre 12 meses ou mais", score: 3 },
    ],
  },
];

export const MAX_SCORE = INVESTOR_QUIZ.length * 3;

export function scoreToProfile(score: number): InvestorProfile {
  const pct = score / MAX_SCORE;
  if (pct < 0.35) return "conservador";
  if (pct < 0.7) return "moderado";
  return "arrojado";
}

export const PROFILE_INFO: Record<
  InvestorProfile,
  { label: string; blurb: string; allocation: { rendaFixa: number; variavel: number } }
> = {
  conservador: {
    label: "Conservador",
    blurb: "Prioriza segurança. Aceita render menos para não ver o dinheiro oscilar.",
    allocation: { rendaFixa: 85, variavel: 15 },
  },
  moderado: {
    label: "Moderado",
    blurb: "Equilíbrio. Aceita alguma oscilação em troca de retorno melhor no médio prazo.",
    allocation: { rendaFixa: 60, variavel: 40 },
  },
  arrojado: {
    label: "Arrojado",
    blurb: "Busca crescimento. Aceita perdas relevantes no curto prazo mirando o longo.",
    allocation: { rendaFixa: 35, variavel: 65 },
  },
};

/** Classes consideradas "renda variável" para comparar com a alocação-alvo. */
export const VARIABLE_CLASSES = new Set(["acao", "fii", "etf", "cripto"]);
