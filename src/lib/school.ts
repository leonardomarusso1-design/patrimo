import type { PlanId } from "@/types/database";

export type Lesson = {
  id: number;
  title: string;
  description: string;
  duration: string;
  planRequired: PlanId;
  /** URL do vídeo. Enquanto vazio, a aula fica "em gravação" e não pode ser concluída. */
  videoUrl?: string;
};

/**
 * Escola Patrimo — 13 aulas. Conteúdo em vídeo será gravado depois;
 * as aulas ficam com cadeado até então (e o gate de plano continua valendo).
 */
export const LESSONS: Lesson[] = [
  { id: 1, title: "Os 4 pilares da liberdade financeira", description: "Orçamento, reserva, investimentos e patrimônio — como se encaixam.", duration: "12 min", planRequired: "free" },
  { id: 2, title: "Vivendo uma vida alugada", description: "Por que a renda alta some e o padrão de vida vira armadilha.", duration: "11 min", planRequired: "essential" },
  { id: 3, title: "O verdadeiro preço das coisas", description: "Custo por hora de trabalho e o teste antes de qualquer compra.", duration: "10 min", planRequired: "essential" },
  { id: 4, title: "Como ficar rico ganhando pouco", description: "Taxa de poupança importa mais que salário. A matemática que prova.", duration: "15 min", planRequired: "essential" },
  { id: 5, title: "Tudo que você aprendeu sobre dinheiro", description: "Desmontando os mitos que te mantêm no vermelho.", duration: "13 min", planRequired: "pro" },
  { id: 6, title: "Juros compostos", description: "O oitavo milagre do mundo — e como o tempo faz o trabalho pesado.", duration: "15 min", planRequired: "pro" },
  { id: 7, title: "Reserva de emergência", description: "Quanto guardar, onde guardar e quando pode usar.", duration: "10 min", planRequired: "pro" },
  { id: 8, title: "Perfil do investidor", description: "Conservador, moderado ou arrojado — e a carteira que combina.", duration: "12 min", planRequired: "pro" },
  { id: 9, title: "Como lidar com dívidas", description: "Bola de neve vs. avalanche e como negociar desconto.", duration: "18 min", planRequired: "elite" },
  { id: 10, title: "Cartão de crédito", description: "A ferramenta que constrói ou destrói. Regras de uso.", duration: "14 min", planRequired: "elite" },
  { id: 11, title: "O que é inflação", description: "O ladrão silencioso e como proteger o poder de compra.", duration: "12 min", planRequired: "elite" },
  { id: 12, title: "O que é a taxa Selic", description: "Selic, CDI e o custo do dinheiro na sua vida.", duration: "16 min", planRequired: "elite" },
  { id: 13, title: "Quando você vai viver de renda", description: "A regra dos 4% e o seu número da independência.", duration: "20 min", planRequired: "elite" },
];

export const SCHOOL_TOTAL = LESSONS.length;
