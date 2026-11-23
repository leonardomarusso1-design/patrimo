export type LessonKind = "aula" | "extra";

export type Lesson = {
  id: number;
  kind: LessonKind;
  slug: string;
  title: string;
  description: string;
  /** Duração real do vídeo, em segundos. */
  durationSeconds: number;
  /** Rótulo mm:ss derivado de durationSeconds. */
  duration: string;
  videoUrl: string;
  captionUrl: string;
  ebookUrl: string;
};

const ACADEMIA_BASE =
  "https://rhztczldzsopjkbaitqg.supabase.co/storage/v1/object/public/academia";

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

function lesson(input: {
  id: number;
  kind: LessonKind;
  slug: string;
  title: string;
  description: string;
  durationSeconds: number;
}): Lesson {
  return {
    ...input,
    duration: formatDuration(input.durationSeconds),
    videoUrl: `${ACADEMIA_BASE}/videos/${input.slug}.mp4`,
    captionUrl: `${ACADEMIA_BASE}/captions/${input.slug}.vtt`,
    ebookUrl: `${ACADEMIA_BASE}/ebooks/${input.slug}-ebook.pdf`,
  };
}

/**
 * Academia Ordre — 13 aulas + 3 extras. Todas incluídas no plano único.
 * Vídeo, legenda e e-book ficam no bucket público `academia`.
 */
export const LESSONS: Lesson[] = [
  lesson({
    id: 1,
    kind: "aula",
    slug: "aula01-os-4-pilares",
    title: "Os 4 pilares da liberdade financeira",
    description: "Orçamento, reserva, investimentos e patrimônio — como se encaixam.",
    durationSeconds: 298,
  }),
  lesson({
    id: 2,
    kind: "aula",
    slug: "aula02-vivendo-uma-vida-alugada",
    title: "Vivendo uma vida alugada",
    description: "Por que a renda alta some e o padrão de vida vira armadilha.",
    durationSeconds: 227,
  }),
  lesson({
    id: 3,
    kind: "aula",
    slug: "aula03-o-verdadeiro-preco-das-coisas",
    title: "O verdadeiro preço das coisas",
    description: "Custo por hora de trabalho e o teste antes de qualquer compra.",
    durationSeconds: 205,
  }),
  lesson({
    id: 4,
    kind: "aula",
    slug: "aula04-como-ficar-rico-ganhando-pouco",
    title: "Como ficar rico ganhando pouco",
    description: "Taxa de poupança importa mais que salário. A matemática que prova.",
    durationSeconds: 223,
  }),
  lesson({
    id: 5,
    kind: "aula",
    slug: "aula05-tudo-que-voce-aprendeu-sobre-dinheiro",
    title: "Tudo que você aprendeu sobre dinheiro",
    description: "Desmontando os mitos que te mantêm no vermelho.",
    durationSeconds: 300,
  }),
  lesson({
    id: 6,
    kind: "aula",
    slug: "aula06-juros-compostos",
    title: "Juros compostos",
    description: "O oitavo milagre do mundo — e como o tempo faz o trabalho pesado.",
    durationSeconds: 287,
  }),
  lesson({
    id: 7,
    kind: "aula",
    slug: "aula07-reserva-de-emergencia",
    title: "Reserva de emergência",
    description: "Quanto guardar, onde guardar e quando pode usar.",
    durationSeconds: 242,
  }),
  lesson({
    id: 8,
    kind: "aula",
    slug: "aula08-perfil-do-investidor",
    title: "Perfil do investidor",
    description: "Conservador, moderado ou arrojado — e a carteira que combina.",
    durationSeconds: 272,
  }),
  lesson({
    id: 9,
    kind: "aula",
    slug: "aula09-como-lidar-com-dividas",
    title: "Como lidar com dívidas",
    description: "Bola de neve vs. avalanche e como negociar desconto.",
    durationSeconds: 255,
  }),
  lesson({
    id: 10,
    kind: "aula",
    slug: "aula10-cartao-de-credito",
    title: "Cartão de crédito",
    description: "A ferramenta que constrói ou destrói. Regras de uso.",
    durationSeconds: 232,
  }),
  lesson({
    id: 11,
    kind: "aula",
    slug: "aula11-o-que-e-inflacao",
    title: "O que é inflação",
    description: "O ladrão silencioso e como proteger o poder de compra.",
    durationSeconds: 234,
  }),
  lesson({
    id: 12,
    kind: "aula",
    slug: "aula12-o-que-e-a-taxa-selic",
    title: "O que é a taxa Selic",
    description: "Selic, CDI e o custo do dinheiro na sua vida.",
    durationSeconds: 213,
  }),
  lesson({
    id: 13,
    kind: "aula",
    slug: "aula13-quando-voce-vai-viver-de-renda",
    title: "Quando você vai viver de renda",
    description: "A regra dos 4% e o seu número da independência.",
    durationSeconds: 238,
  }),
  lesson({
    id: 14,
    kind: "extra",
    slug: "extra01-renda-fixa-e-tesouro-direto",
    title: "Renda fixa e Tesouro Direto",
    description: "Tesouro Selic, IPCA+ e Prefixado — o que muda e quando usar cada um.",
    durationSeconds: 275,
  }),
  lesson({
    id: 15,
    kind: "extra",
    slug: "extra02-cdb-lci-lca-e-fgc",
    title: "CDB, LCI/LCA e FGC",
    description: "CDB, LCI e LCA: rentabilidade, liquidez e o que o FGC cobre.",
    durationSeconds: 261,
  }),
  lesson({
    id: 16,
    kind: "extra",
    slug: "extra03-renda-passiva",
    title: "Renda passiva",
    description: "De onde vem a renda que não depende do salário e como montá-la.",
    durationSeconds: 289,
  }),
];

export const SCHOOL_TOTAL = LESSONS.length;
