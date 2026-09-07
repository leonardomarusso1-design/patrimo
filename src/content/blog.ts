export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
  tags: string[];
  /** Markdown simples (h1/h2, listas, tabelas, parágrafos, --- e *itálico*). */
  content: string;
};

/**
 * 10 artigos iniciais de educação financeira, com fontes citadas.
 * Servem para SEO e para atrair usuários ao produto. Conteúdo comprovado —
 * nada de números inventados sem fonte.
 */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "regra-50-30-20",
    title: "A regra 50-30-20: o método que organiza qualquer salário",
    excerpt:
      "Divida a renda em 50% necessidades, 30% desejos e 20% para poupar e investir. Por que essa estrutura simples funciona — e como adaptar ao Brasil.",
    author: "Time Patrimo",
    publishedAt: "2026-08-01",
    readingMinutes: 6,
    tags: ["orçamento", "iniciante"],
    content: `# A regra 50-30-20

Criada pela senadora americana Elizabeth Warren e sua filha Amelia Warren Tyagi no livro *All Your Worth* (2005), a regra 50-30-20 é um dos métodos de orçamento mais usados no mundo.

## Como funciona

- **50% — Necessidades:** aluguel, contas, mercado, transporte, saúde.
- **30% — Desejos:** lazer, restaurantes, streaming, viagens.
- **20% — Poupança e investimentos:** reserva de emergência, aposentadoria, metas.

## Por que funciona

Um estudo do Federal Reserve (2020) apontou que 36% dos americanos não cobririam uma despesa emergencial de US$ 400. A regra cria uma estrutura que prioriza segurança financeira sem cortar todo o prazer.

## Adaptando ao Brasil

Com juros e inflação mais voláteis, especialistas sugerem variações: **50-20-30** (mais para poupança) ou **40-30-30** para quem carrega dívidas caras.

## No Patrimo

O módulo de Orçamento calcula seus percentuais automaticamente e avisa quando um grupo passa do limite.

---
*Fonte: Warren, E. & Tyagi, A. W. (2005). All Your Worth. Free Press.*`,
  },
  {
    slug: "reserva-de-emergencia-6-ou-12-meses",
    title: "Reserva de emergência: 6 ou 12 meses?",
    excerpt:
      "Famílias com reserva de 3+ meses têm menos chance de se endividar no curto prazo. Veja qual nível faz sentido pro seu tipo de renda.",
    author: "Time Patrimo",
    publishedAt: "2026-08-04",
    readingMinutes: 5,
    tags: ["reserva", "iniciante"],
    content: `# Reserva de emergência: 6 ou 12 meses?

A reserva é o alicerce de qualquer plano financeiro. A pergunta é quanto guardar.

## O que diz a pesquisa

Um estudo do Pew Charitable Trusts (2019) encontrou que famílias com reserva de 3+ meses de despesas têm menor chance de endividamento de curto prazo e menos estresse financeiro reportado.

## 6 meses (nível Básico)

Faz sentido para quem tem emprego estável (CLT, servidor), plano de saúde pelo empregador e nenhum dependente.

## 12 meses (nível Blindado)

Recomendado para autônomos e PJ, quem tem dependentes, ou trabalha em setor volátil.

## Onde guardar

Ativos líquidos e seguros: Tesouro Selic, CDB de liquidez diária, fundos DI. **Nunca** em ações, cripto ou imóveis.

## No Patrimo

O módulo de Reserva analisa seu custo de vida essencial e mostra o alvo (6 ou 12 meses), com acompanhamento visual.

---
*Fonte: Pew Charitable Trusts (2019). The Role of Emergency Savings in Family Financial Security.*`,
  },
  {
    slug: "juros-compostos",
    title: "Juros compostos: a força que transforma aportes pequenos em fortuna",
    excerpt:
      "R$ 500 por mês a 10% ao ano viram mais de R$ 1 milhão em 30 anos. E adiar 10 anos custa mais de R$ 700 mil. A matemática por trás.",
    author: "Time Patrimo",
    publishedAt: "2026-08-07",
    readingMinutes: 6,
    tags: ["investimentos", "juros compostos"],
    content: `# Juros compostos

Com juros compostos, o dinheiro rende — e o rendimento também rende. É uma bola de neve matemática.

## O exemplo

| Aporte mensal | Taxa anual | Prazo | Montante |
|---|---|---|---|
| R$ 500 | 10% | 30 anos | ~R$ 1,08 milhão |
| R$ 1.000 | 10% | 30 anos | ~R$ 2,16 milhões |
| R$ 500 | 12% | 30 anos | ~R$ 1,75 milhão |

## O inimigo é a procrastinação

Começar aos 25 vs. aos 35, aportando R$ 500/mês a 10% a.a., faz diferença de centenas de milhares de reais no total acumulado aos 55.

## A fórmula

**M = P × (1 + i)ⁿ**, onde P é o principal, i a taxa por período e n o número de períodos.

## No Patrimo

As calculadoras mostram a projeção em tempo real: defina meta, veja o aporte necessário, acompanhe o progresso.

---
*Fonte: adaptado de Hardy, D. (2010). The Compound Effect; dados de referência do Banco Central do Brasil.*`,
  },
  {
    slug: "perfil-de-investidor",
    title: "Perfil de investidor: conservador, moderado ou arrojado?",
    excerpt:
      "O desalinhamento entre perfil e carteira causa ansiedade e decisões impulsivas. Descubra o seu e a alocação que combina.",
    author: "Time Patrimo",
    publishedAt: "2026-08-10",
    readingMinutes: 5,
    tags: ["investimentos", "perfil"],
    content: `# Perfil de investidor

A CVM exige que corretoras avaliem o perfil do investidor antes de liberar operações. O motivo é prático: carteira desalinhada do perfil gera decisões ruins.

## Os três perfis

- **Conservador:** prioriza segurança. Carteira de referência: ~80% renda fixa, 20% variável.
- **Moderado:** equilíbrio. ~60% renda fixa, 40% variável.
- **Arrojado:** busca retorno, aceita volatilidade. ~40% renda fixa, 60% variável.

## O erro comum

Investir em ações sendo conservador, ou deixar tudo na poupança sendo arrojado. Os dois levam a arrependimento.

## No Patrimo

No plano Elite, a IA observa seu comportamento real (não só o que você declara) e sugere ajustes de carteira.

---
*Fonte: CVM — materiais de educação do investidor.*`,
  },
  {
    slug: "open-finance-no-brasil",
    title: "Open Finance no Brasil: o que é e por que usar",
    excerpt:
      "Desde 2021 você decide quem acessa seus dados bancários. Como isso automatiza o controle financeiro — com consentimento e revogação a qualquer momento.",
    author: "Time Patrimo",
    publishedAt: "2026-08-13",
    readingMinutes: 5,
    tags: ["open finance", "automação"],
    content: `# Open Finance no Brasil

Regulamentado pelo Banco Central desde 2021, o Open Finance permite compartilhar seus dados financeiros entre instituições de forma segura e controlada.

## Fases

| Fase | Quando | O que liberou |
|---|---|---|
| 1 | Fev/2021 | Dados cadastrais |
| 2 | Jul/2021 | Contas e transações |
| 3 | Ago/2021 | Iniciação de pagamentos |
| 4 | Dez/2021 | Produtos de crédito |

## Benefícios

Visão consolidada de todas as contas, ofertas melhores baseadas em dados reais, categorização automática e controle: você aprova e revoga cada compartilhamento.

## Segurança

Consentimento explícito, token com validade limitada, revogação a qualquer momento, LGPD aplicada.

## No Patrimo

No plano Elite conectamos suas contas via Open Finance e as transações entram categorizadas.

---
*Fonte: Banco Central do Brasil — portal Open Finance.*`,
  },
  {
    slug: "diversificacao",
    title: "Diversificação: por que não colocar todos os ovos na mesma cesta",
    excerpt:
      "Harry Markowitz ganhou o Nobel provando que diversificar reduz risco sem sacrificar retorno esperado. As 5 dimensões que importam.",
    author: "Time Patrimo",
    publishedAt: "2026-08-16",
    readingMinutes: 5,
    tags: ["investimentos", "carteira"],
    content: `# Diversificação

Harry Markowitz recebeu o Nobel de Economia em 1990 pela Teoria Moderna de Carteiras: diversificação inteligente reduz risco sem reduzir o retorno esperado.

## Não é ter 10 ações

É ter ativos que reagem de forma diferente aos mesmos cenários.

## As 5 dimensões

1. **Classe de ativo:** renda fixa, variável, imóveis, internacional.
2. **Setor:** tecnologia, saúde, energia, financeiro.
3. **Geografia:** Brasil, EUA, Europa, Ásia.
4. **Moeda:** real, dólar, euro.
5. **Prazo:** curto, médio e longo.

## No Patrimo

O gráfico de composição da carteira mostra onde você está concentrado e alerta quando um ativo passa de 20% do total.

---
*Fonte: Markowitz, H. (1952). Portfolio Selection. The Journal of Finance.*`,
  },
  {
    slug: "regra-dos-4-por-cento",
    title: "Independência financeira: a regra dos 4%",
    excerpt:
      "O estudo Trinity analisou 70 anos de dados e concluiu: retirar 4% do patrimônio ao ano tende a ser sustentável. Calcule o seu número.",
    author: "Time Patrimo",
    publishedAt: "2026-08-19",
    readingMinutes: 6,
    tags: ["independência financeira", "FIRE"],
    content: `# A regra dos 4%

O *Trinity Study* (1998) analisou dados de 1926 a 1995 e concluiu que retirar cerca de 4% do patrimônio por ano tende a ser sustentável no longo prazo.

## Seu número

| Despesa mensal | Patrimônio necessário |
|---|---|
| R$ 5.000 | R$ 1.500.000 |
| R$ 10.000 | R$ 3.000.000 |
| R$ 20.000 | R$ 6.000.000 |

## O movimento FIRE

*Financial Independence, Retire Early*: viver abaixo dos meios, investir com consistência, comprar tempo. Variantes: Lean FIRE, Fat FIRE, Coast FIRE.

## No Patrimo

A calculadora de independência mostra quanto acumular, quanto aportar por mês e quando você chega lá.

---
*Fonte: Cooley, Hubbard & Walz (1998). Retirement Savings: Choosing a Withdrawal Rate That Is Sustainable. AAII Journal.*`,
  },
  {
    slug: "imposto-de-renda-investimentos",
    title: "Imposto de Renda nos investimentos: como pagar menos, legalmente",
    excerpt:
      "Isenção de R$ 20 mil/mês em ações, alíquota regressiva que cai de 22,5% para 15%, come-cotas em fundos. O que muda o resultado no fim do ano.",
    author: "Time Patrimo",
    publishedAt: "2026-08-22",
    readingMinutes: 6,
    tags: ["impostos", "investimentos"],
    content: `# IR nos investimentos

Existem formas legais de reduzir o imposto sobre investimentos.

## Alíquota regressiva (renda fixa e fundos)

| Prazo | Alíquota |
|---|---|
| Até 180 dias | 22,5% |
| 181 a 360 dias | 20% |
| 361 a 720 dias | 17,5% |
| Acima de 720 dias | 15% |

Segurar renda fixa por mais de 2 anos derruba a alíquota para 15%.

## Isenção em ações

Vendas de ações na bolsa até R$ 20.000 no mês, com lucro, são isentas de IR (day trade não entra).

## Isentos de IR

LCI, LCA, CRI, CRA, debêntures incentivadas e poupança.

## Come-cotas

Fundos abertos antecipam IR a cada 6 meses. Tesouro Direto só recolhe no resgate — diferença que pode somar ao longo dos anos.

## No Patrimo

O relatório fiscal anual (plano Elite) resume vendas, lucros, prejuízos a compensar e preço médio.

---
*Fonte: Receita Federal — regras vigentes de tributação de aplicações financeiras. Confirme alíquotas e limites no ano-calendário.*`,
  },
  {
    slug: "onde-o-dinheiro-rende-mais",
    title: "Onde o dinheiro rende mais: poupança, Tesouro, CDB, LCI e ações",
    excerpt:
      "Comparativo de rentabilidade, liquidez e risco. E o custo real de deixar a reserva parada na poupança.",
    author: "Time Patrimo",
    publishedAt: "2026-08-25",
    readingMinutes: 6,
    tags: ["renda fixa", "comparativo"],
    content: `# Onde o dinheiro rende mais

A escolha da aplicação depende de três coisas: prazo, liquidez e tolerância a risco.

## Comparativo (referência)

| Aplicação | Liquidez | Risco | IR |
|---|---|---|---|
| Poupança | Diária | Baixíssimo | Isento |
| Tesouro Selic | D+1 | Baixíssimo | Regressivo |
| CDB 100% CDI | D+0 a D+2 | Baixo (FGC) | Regressivo |
| LCI / LCA | Carência | Baixo (FGC) | Isento |
| Tesouro IPCA+ | D+1 | Baixo (marcação a mercado) | Regressivo |
| Ações / FIIs | D+2 | Alto | 15% / 20% |

## Onde deixar a reserva

Tesouro Selic ou CDB de liquidez diária. Segurança e liquidez pesam mais que rentabilidade aqui.

## Longo prazo

Tesouro IPCA+ para proteção contra inflação, ações e FIIs para crescimento real.

## O custo da poupança

A poupança rende menos que o Tesouro Selic. Ao longo de anos, essa diferença some milhares de reais.

---
*Fonte: Banco Central do Brasil (Relatório Focus) e ANBIMA. Rentabilidades variam com a Selic e o emissor.*`,
  },
  {
    slug: "como-sair-das-dividas",
    title: "Como sair das dívidas: bola de neve vs. avalanche",
    excerpt:
      "Liste tudo, calcule o custo real de cada dívida, escolha uma estratégia e negocie. O passo a passo que funciona sob pressão.",
    author: "Time Patrimo",
    publishedAt: "2026-08-28",
    readingMinutes: 6,
    tags: ["dívidas", "iniciante"],
    content: `# Como sair das dívidas

Sair da dívida é possível com método e disciplina.

## Passo 1 — liste tudo

Cartão, empréstimo pessoal, consignado, financiamento, dívida com pessoas próximas.

## Passo 2 — calcule o custo real

| Dívida | Taxa mensal aproximada |
|---|---|
| Rotativo do cartão | ~15% |
| Cheque especial | ~8% |
| Empréstimo pessoal | ~5% |
| Consignado | ~2% |

## Passo 3 — escolha a estratégia

- **Bola de neve (Ramsey):** quita a menor dívida primeiro. Gera vitórias rápidas e motivação.
- **Avalanche:** quita a mais cara primeiro. Economiza mais no total.

## Passo 4 — negocie

Ligue para o credor e ofereça pagamento à vista com desconto. É comum aceitarem abatimento para quitação.

## Passo 5 — não volte

Deixe um cartão só, corte o cheque especial, monte a reserva antes de investir.

## No Patrimo

O módulo de Dívidas mostra o custo real de cada uma e simula bola de neve vs. avalanche.

---
*Fonte: Ramsey, D. (2003). The Total Money Makeover; dados de inadimplência de Serasa Experian.*`,
  },
];

export function getPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}
