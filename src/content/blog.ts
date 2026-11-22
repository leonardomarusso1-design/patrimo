export type BlogPostCover = {
  src: string;
  alt: string;
};

export type BlogCategory =
  | "Comece aqui"
  | "Orçamento e dívidas"
  | "Reserva e metas"
  | "Investimentos"
  | "Conceitos e indicadores"
  | "Calculadoras";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
  tags: string[];
  category: BlogCategory;
  /** id da calculadora relacionada em /app/calculadoras (CTA no fim do artigo). */
  calc?: string;
  /** Capa opcional. Sem ela, a página usa o degradê gerado pelo slug. */
  coverImage?: BlogPostCover;
  /** Markdown simples: títulos, listas, tabelas, links e imagens locais. Sem HTML. */
  content: string;
};

export const BLOG_CATEGORY_ORDER: BlogCategory[] = [
  "Comece aqui",
  "Orçamento e dívidas",
  "Reserva e metas",
  "Investimentos",
  "Conceitos e indicadores",
  "Calculadoras",
];

/**
 * Artigos de educação financeira, com fontes citadas.
 * Servem para SEO e para atrair usuários ao produto. Conteúdo comprovado —
 * nada de números inventados sem fonte.
 */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "regra-50-30-20",
    title: "A regra 50-30-20: o método que organiza qualquer salário",
    excerpt:
      "Divida a renda em 50% necessidades, 30% desejos e 20% para poupar e investir. Por que essa estrutura simples funciona — e como adaptar ao Brasil.",
    author: "Time Ordre",
    publishedAt: "2026-08-01",
    readingMinutes: 6,
    tags: ["orçamento", "iniciante"],
    category: "Orçamento e dívidas",
    calc: "503020",
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

## No Ordre

O módulo de Orçamento calcula seus percentuais automaticamente e avisa quando um grupo passa do limite.

---
*Fonte: Warren, E. & Tyagi, A. W. (2005). All Your Worth. Free Press.*`,
  },
  {
    slug: "reserva-de-emergencia-6-ou-12-meses",
    title: "Reserva de emergência: 6 ou 12 meses?",
    excerpt:
      "Quase um terço dos brasileiros não tem reserva para um imprevisto. Veja quanto guardar, onde deixar o dinheiro e quando pode usar — com dados da ANBIMA e do Banco Central.",
    author: "Time Ordre",
    publishedAt: "2026-08-04",
    readingMinutes: 5,
    tags: ["reserva", "iniciante"],
    category: "Reserva e metas",
    calc: "reserva",
    coverImage: {
      src: "/blog/reserva-de-emergencia-6-ou-12-meses.webp",
      alt: "Professor Bento, um professor idoso de cardigã verde e gravata-borboleta dourada, em uma sala de aula clara, ao lado de um cofre de porquinho e um pote de moedas.",
    },
    content: `# Reserva de emergência: 6 ou 12 meses?

A reserva de emergência é o dinheiro que existe para um imprevisto: perder o emprego, um conserto do carro, uma despesa de saúde. Ela não é investimento para ficar rico. É o colchão que impede um susto de virar dívida cara.

Na 9ª edição do [Raio-X do Investidor Brasileiro](https://www.anbima.com.br/pt_br/especial/raio-x-do-investidor-brasileiro.htm) (ANBIMA e Datafolha, campo de 4 a 21 de novembro de 2025, 5.832 entrevistas), **31% dos brasileiros não tinham reserva para uma emergência**. Para outros 20%, o que havia guardado duraria no máximo um mês. Só **26% da população** teriam recursos para se manter por mais de seis meses. Entre quem o estudo classifica como investidor, 11% ainda assim não tinham reserva.

Esse texto é educativo e não é recomendação de investimento.

## Quanto guardar

O alvo costuma ser um múltiplo do **custo essencial** — o que você precisa para viver um mês sem o supérfluo: moradia, alimentação, transporte, saúde, contas básicas. Não é a renda bruta, e não entra streaming, delivery e lazer.

Uma referência prática, usada também no módulo de Reserva do Ordre:

- **6 meses (nível Básico):** faz sentido para quem tem renda relativamente estável (CLT ou servidor), poucos dependentes e alguma rede de apoio.
- **12 meses (nível Blindado):** faz mais sentido para autônomos, PJ, quem tem dependentes, trabalha em setor instável ou é a única renda da casa.

Três meses é melhor do que zero, e pode ser um primeiro degrau. Não precisa chegar no alvo de uma vez: o hábito de separar um pedaço da renda todo mês importa mais do que acertar o número perfeito no começo.

O estudo da ANBIMA mostra a distância entre o recomendado e o real: mesmo entre investidores, quase metade teria reserva para no máximo seis meses.

## Onde guardar

A reserva precisa de três coisas ao mesmo tempo: **liquidez** (sair rápido), **segurança** (não pode oscilar forte) e um rendimento que pelo menos dispute com a inflação. Por isso ela não combina com ações, fundos imobiliários, criptomoedas ou imóvel.

Caminhos comuns no Brasil:

- **Tesouro Selic**, com liquidez em D+1. É o título público que menos sofre com a marcação a mercado, mas [não é verdade que "nunca" tenha variação negativa](/blog/tesouro-direto) em prazos muito curtos.
- **CDB de liquidez diária**, de preferência de um banco coberto pelo [FGC](https://www.fgc.org.br/sobre-garantia-fgc).
- **Fundos DI** de taxa baixa, se a liquidez for diária — lembrando do come-cotas.

O FGC cobre até **R$ 250 mil por CPF por instituição** (somando CDB, LCI, LCA, poupança e outros produtos elegíveis no mesmo conglomerado). Há ainda um **teto global de R$ 1 milhão** a cada período de quatro anos. Quem concentra um valor alto num único banco deve dividir o risco. Tesouro Selic não depende do FGC: a garantia é do Tesouro Nacional.

A [poupança](/blog/onde-o-dinheiro-rende-mais) é líquida e isenta de IR, mas, com a Selic acima de 8,5% ao ano, rende 0,5% ao mês mais a TR — em geral abaixo de um Tesouro Selic ou de um CDB de liquidez diária, depois do imposto. A diferença se acumula.

## Quando pode usar — e quando não deve

Pode usar quando o imprevisto é real e não cabe no orçamento do mês: desemprego, emergência de saúde, conserto indispensável, uma conta atrasada que cobraria juros muito mais altos do que o rendimento da reserva.

Não é para viagem, troca de celular ou entrada de um bem que pode esperar. Se você sacar, o próximo passo é repor. Sem a reposição, a reserva vira um número que existiu só no papel.

Uma regra que evita confusão: a reserva fica num produto (ou em poucos produtos) separado do dinheiro do dia a dia e separado dos investimentos de longo prazo.

## Como começar hoje

1. Some o custo essencial de um mês. Se ainda não lança as despesas, comece por aí.
2. Multiplique por 6 ou por 12, conforme o tipo de renda.
3. Veja quanto já tem em aplicações líquidas e seguras. O que falta é o alvo.
4. Defina um aporte mensal realista. A [regra 50-30-20](/blog/regra-50-30-20) reserva 20% da renda para poupar e investir; no começo, boa parte desse pedaço pode ir para a reserva.
5. Só depois de a reserva estar de pé faz sentido aumentar o risco da carteira.

Na [Academia Ordre](/app/escola), a aula 7 ("Reserva de emergência") aprofunda o mesmo tema em vídeo. A aula 1 mostra como a reserva se encaixa nos quatro pilares, junto com orçamento, investimentos e patrimônio.

## No Ordre

O módulo de Reserva usa o seu custo de vida essencial e mostra o alvo de 6 ou 12 meses, com o acompanhamento visual do quanto já está coberto. A calculadora de Reserva faz a conta com os seus números. No Início, um alerta aparece quando a reserva fica abaixo de 30% da meta. As [Metas](/cadastro) ajudam a programar o aporte mensal até o alvo.

O Assistente tira dúvidas sobre o seu próprio orçamento; ele não recomenda investimento e não é consultoria.

---
*Fontes: ANBIMA e Datafolha, Raio-X do Investidor Brasileiro, 9ª edição (campo de 4 a 21/11/2025; a pergunta sobre reserva entrou nesta edição). FGC, [regras de cobertura](https://www.fgc.org.br/sobre-garantia-fgc). Banco Central do Brasil (Selic e regra da poupança quando a meta está acima de 8,5% a.a.). Tesouro Nacional — programa Tesouro Direto. Atualizado em 22/11/2026. Conteúdo educativo, não é recomendação de investimento.*`,
  },
  {
    slug: "juros-compostos",
    title: "Juros compostos: a força que transforma aportes pequenos em fortuna",
    excerpt:
      "R$ 500 por mês a 10% ao ano, com aporte no fim de cada mês, viram cerca de R$ 1,13 milhão em 30 anos. Adiar dez anos custa cerca de R$ 750 mil.",
    author: "Time Ordre",
    publishedAt: "2026-08-07",
    readingMinutes: 3,
    tags: ["investimentos", "juros compostos"],
    category: "Conceitos e indicadores",
    calc: "juros",
    content: `# Juros compostos

Com juros compostos, o dinheiro rende — e o rendimento também rende. É uma bola de neve matemática. As contas abaixo são simulação: sem imposto, sem inflação e sem taxa.

## Capital único

Um valor aplicado de uma vez e deixado lá segue:

**M = P × (1 + i)ⁿ**

P é o principal, i a taxa do período e n o número de períodos. A taxa e o prazo precisam estar na mesma unidade. R$ 1.000 a 10% ao ano, durante 5 anos, viram cerca de R$ 1.611. Em 30 anos, os mesmos R$ 1.000 viram cerca de R$ 17.449.

## Aporte mensal

"R$ 500 por mês" usa outra conta. Com um aporte igual no fim de cada mês, o montante é a série uniforme, também chamada de anuidade ordinária:

**M = PMT × [((1 + i)ⁿ − 1) ÷ i]**

PMT é o aporte, i a taxa mensal e n o número de meses. Nesta tabela, a taxa mensal é a taxa anual nominal dividida por 12 (10% ao ano vira cerca de 0,833% ao mês):

| Aporte mensal | Taxa anual nominal | Prazo | Montante |
|---|---|---|---|
| R$ 500 | 10% | 30 anos (360 meses) | ~R$ 1,13 milhão |
| R$ 1.000 | 10% | 30 anos (360 meses) | ~R$ 2,26 milhões |
| R$ 500 | 12% | 30 anos (360 meses) | ~R$ 1,75 milhão |

No primeiro caso, i = 0,10 ÷ 12 e n = 360. O resultado fica em torno de R$ 1,13 milhão. Tratar o ano inteiro (R$ 6.000) como um único aporte no começo de cada ano dá cerca de R$ 1,08 milhão: é a conta de um aporte anual, não a do aporte mensal.

## O inimigo é a procrastinação

Começar aos 25 ou aos 35, com R$ 500 por mês a 10% ao ano na mesma convenção da tabela, até os 55:

- dos 25 aos 55 (30 anos): cerca de R$ 1,13 milhão;
- dos 35 aos 55 (20 anos): cerca de R$ 380 mil.

A diferença fica em torno de **R$ 750 mil**. Dez anos a menos de aportes, nessa simulação, passam de R$ 700 mil.

## No Ordre

As calculadoras mostram a projeção com os seus números: defina a meta, veja o aporte e acompanhe o progresso. O resultado usa a taxa que você informar e descreve a conta.

---
*Fonte: fórmula de juros compostos para capital único e fórmula da série uniforme (anuidade ordinária, aporte no fim do período, taxa mensal = taxa anual nominal ÷ 12). Valores simulados, sem IR, inflação ou custos.*`,
  },
  {
    slug: "perfil-de-investidor",
    title: "Perfil de investidor: conservador, moderado ou arrojado?",
    excerpt:
      "O desalinhamento entre perfil e carteira causa ansiedade e decisões impulsivas. Descubra o seu e a alocação que combina.",
    author: "Time Ordre",
    publishedAt: "2026-08-10",
    readingMinutes: 1,
    tags: ["investimentos", "perfil"],
    category: "Comece aqui",
    content: `# Perfil de investidor

A CVM exige que corretoras avaliem o perfil do investidor (suitability) antes de liberar operações. Carteira desalinhada do perfil gera decisões ruins. As fatias abaixo são a sugestão do quiz do Ordre, a mesma divisão que o app mostra.

## Os três perfis

- **Conservador:** prioriza segurança. Referência no Ordre: **85% renda fixa e 15% renda variável**.
- **Moderado:** equilíbrio entre os dois. **60% renda fixa e 40% renda variável**.
- **Arrojado:** busca retorno e aceita oscilação. **35% renda fixa e 65% renda variável**.

## O erro comum

Investir em ações sendo conservador, ou deixar tudo na poupança sendo arrojado. Os dois levam a arrependimento.

## No Ordre

O quiz de perfil sugere essa divisão. O módulo de Investimentos acompanha quanto você tem em cada classe. A sugestão organiza a carteira; a decisão de aplicar continua sua.

---
*Fonte: CVM, regras de suitability das corretoras. As fatias 85/15, 60/40 e 35/65 são a referência do quiz do Ordre.*`,
  },
  {
    slug: "open-finance-no-brasil",
    title: "Open Finance no Brasil: o que é e por que usar",
    excerpt:
      "Desde 2021 você decide quem acessa seus dados bancários. Como isso automatiza o controle financeiro — com consentimento e revogação a qualquer momento.",
    author: "Time Ordre",
    publishedAt: "2026-08-13",
    readingMinutes: 2,
    tags: ["open finance", "automação"],
    category: "Comece aqui",
    content: `# Open Finance no Brasil

Regulamentado pelo Banco Central desde 2021, o Open Finance permite compartilhar seus dados financeiros entre instituições de forma segura e controlada.

## Fases

| Fase | Quando | O que liberou |
|---|---|---|
| 1 | Fev/2021 | Dados cadastrais |
| 2 | Jul/2021 | Contas e transações |
| 3 | Ago/2021 | Iniciação de pagamentos |
| 4 | A partir de dez/2021 | Crédito, investimentos, seguros, câmbio e previdência, com datas escalonadas |

Cada produto dessa fase entrou em datas diferentes. O calendário vigente está no portal do Banco Central.

## Benefícios

Visão consolidada de todas as contas, ofertas melhores baseadas em dados reais, categorização automática e controle: você aprova e revoga cada compartilhamento.

## Segurança

Consentimento explícito, token com validade limitada, revogação a qualquer momento, LGPD aplicada.

## No Ordre

A tela de Open Finance do app está com cadeado e o aviso de em construção. A conexão com os bancos ainda não está liberada. Enquanto isso, as movimentações entram no Orçamento pelo lançamento manual. Quando a conexão existir, o compartilhamento segue com o seu consentimento e com revogação a qualquer momento.

---
*Fonte: Banco Central do Brasil — portal Open Finance. No Ordre, a tela de conexão segue bloqueada (conferido em 22/11/2026).*`,
  },
  {
    slug: "diversificacao",
    title: "Diversificação: por que não colocar todos os ovos na mesma cesta",
    excerpt:
      "Harry Markowitz ganhou o Nobel provando que diversificar reduz risco sem sacrificar retorno esperado. As 5 dimensões que importam.",
    author: "Time Ordre",
    publishedAt: "2026-08-16",
    readingMinutes: 5,
    tags: ["investimentos", "carteira"],
    category: "Investimentos",
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

## No Ordre

O gráfico de composição da carteira mostra onde você está concentrado e alerta quando um ativo passa de 20% do total.

---
*Fonte: Markowitz, H. (1952). Portfolio Selection. The Journal of Finance.*`,
  },
  {
    slug: "regra-dos-4-por-cento",
    title: "Independência financeira: a regra dos 4%",
    excerpt:
      "O estudo Trinity analisou 70 anos de dados e concluiu: retirar 4% do patrimônio ao ano tende a ser sustentável. Calcule o seu número.",
    author: "Time Ordre",
    publishedAt: "2026-08-19",
    readingMinutes: 6,
    tags: ["independência financeira", "FIRE"],
    category: "Reserva e metas",
    calc: "fire",
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

## No Ordre

A calculadora de independência mostra quanto acumular, quanto aportar por mês e quando você chega lá.

---
*Fonte: Cooley, Hubbard & Walz (1998). Retirement Savings: Choosing a Withdrawal Rate That Is Sustainable. AAII Journal.*`,
  },
  {
    slug: "imposto-de-renda-investimentos",
    title: "Imposto de Renda nos investimentos: como pagar menos, legalmente",
    excerpt:
      "Isenção de R$ 20 mil/mês em ações, alíquota regressiva que cai de 22,5% para 15%, come-cotas em fundos. O que muda o resultado no fim do ano.",
    author: "Time Ordre",
    publishedAt: "2026-08-22",
    readingMinutes: 6,
    tags: ["impostos", "investimentos"],
    category: "Investimentos",
    calc: "ir",
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

## No Ordre

O relatório fiscal anual resume vendas, lucros, prejuízos a compensar e preço médio.

---
*Fonte: Receita Federal — regras vigentes de tributação de aplicações financeiras. Confirme alíquotas e limites no ano-calendário.*`,
  },
  {
    slug: "onde-o-dinheiro-rende-mais",
    title: "Onde o dinheiro rende mais: poupança, Tesouro, CDB, LCI e ações",
    excerpt:
      "Comparativo de rentabilidade, liquidez e risco. E o custo real de deixar a reserva parada na poupança.",
    author: "Time Ordre",
    publishedAt: "2026-08-25",
    readingMinutes: 2,
    tags: ["renda fixa", "comparativo"],
    category: "Investimentos",
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

Tesouro Selic ou CDB de liquidez diária. Segurança e liquidez pesam mais que rentabilidade aqui. Produtos elegíveis ao [FGC](https://www.fgc.org.br/sobre-garantia-fgc) têm cobertura de até R$ 250 mil por CPF por instituição, com teto global de R$ 1 milhão a cada quatro anos. A garantia do Tesouro Direto é do Tesouro Nacional.

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
    author: "Time Ordre",
    publishedAt: "2026-08-28",
    readingMinutes: 6,
    tags: ["dívidas", "iniciante"],
    category: "Orçamento e dívidas",
    calc: "divida",
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

## No Ordre

O módulo de Dívidas mostra o custo real de cada uma e simula bola de neve vs. avalanche.

---
*Fonte: Ramsey, D. (2003). The Total Money Makeover; dados de inadimplência de Serasa Experian.*`,
  },
  {
    slug: "juros-simples",
    title: "Juros simples vs. juros compostos: a diferença que muda tudo",
    excerpt:
      "No juros simples a taxa incide sempre sobre o valor inicial. No composto, sobre o acumulado. Em prazos longos, a diferença vira uma montanha.",
    author: "Time Ordre",
    publishedAt: "2026-09-08",
    readingMinutes: 4,
    tags: ["conceitos", "iniciante"],
    category: "Conceitos e indicadores",
    calc: "juros-simples",
    content: `# Juros simples vs. juros compostos

## Juros simples

A taxa incide **sempre sobre o valor inicial**. A fórmula é direta:

Montante = Capital × (1 + taxa × tempo)

R$ 1.000 a 10% ao ano por 5 anos → R$ 1.000 + (R$ 100 × 5) = **R$ 1.500**.

Cada ano rende os mesmos R$ 100. Aparece em alguns contratos de financiamento, multas e cálculos rápidos.

## Juros compostos

A taxa incide sobre o **valor acumulado** — juros sobre juros. Os mesmos R$ 1.000 a 10% ao ano por 5 anos viram **R$ 1.610,51**, porque no segundo ano você rende sobre R$ 1.100, no terceiro sobre R$ 1.210, e assim por diante.

## Por que isso importa

Em 30 anos, R$ 1.000 a 10% a.a.:

- **Juros simples:** R$ 4.000
- **Juros compostos:** R$ 17.449

A diferença acelera com o tempo. É por isso que dívida no rotativo do cartão destrói um orçamento, e investir cedo constrói patrimônio.

## No Ordre

A calculadora de Juros compostos projeta seus aportes mês a mês. A de Juros simples serve para comparar contratos.

---
*Referência: matemática financeira padrão.*`,
  },
  {
    slug: "primeiro-milhao",
    title: "Quanto poupar por mês para chegar ao primeiro milhão",
    excerpt:
      "Não é sobre sorte nem salário alto. É aporte constante, tempo e uma taxa de retorno realista. Veja os números.",
    author: "Time Ordre",
    publishedAt: "2026-09-09",
    readingMinutes: 5,
    tags: ["metas", "investimentos"],
    category: "Reserva e metas",
    calc: "primeiro-milhao",
    content: `# Quanto poupar por mês para chegar ao primeiro milhão

O "primeiro milhão" é uma meta simbólica, mas útil: obriga a pensar em aporte, prazo e retorno ao mesmo tempo.

## Os três botões

1. **Aporte mensal** — o quanto você consegue guardar.
2. **Prazo** — quantos anos até a meta.
3. **Retorno real** — juros acima da inflação. Premissa conservadora no Brasil: **4% a 6% ao ano acima do IPCA** numa carteira diversificada.

## Cenários (retorno de 6% a.a., partindo do zero)

| Aporte mensal | Anos até R$ 1 milhão |
|---|---|
| R$ 1.000 | ~28 anos |
| R$ 2.000 | ~20 anos |
| R$ 3.500 | ~14 anos |
| R$ 5.000 | ~11 anos |

Dobrar o aporte **não** corta o prazo pela metade — o tempo é quem faz o trabalho pesado dos juros compostos.

## A lição

Começar cedo com pouco vence começar tarde com muito. Quem aporta R$ 500 aos 25 chega perto de quem aporta R$ 1.500 aos 40.

## No Ordre

A calculadora "Primeiro milhão" resolve para o aporte: você diz a meta, o prazo e o retorno, ela diz quanto guardar por mês. As Metas acompanham o progresso real.

---
*Referência: valor presente de série de pagamentos.*`,
  },
  {
    slug: "quanto-rende-o-cdi",
    title: "Quanto rende o CDI, e por que ele é a régua da renda fixa",
    excerpt:
      "CDB de 100% do CDI, 110%, LCI isenta... entenda o que o CDI é, quanto paga hoje e como comparar o rendimento líquido, com a alíquota certa para cada prazo.",
    author: "Time Ordre",
    publishedAt: "2026-09-10",
    readingMinutes: 5,
    tags: ["renda fixa", "iniciante"],
    category: "Investimentos",
    calc: "cdi",
    coverImage: {
      src: "/blog/quanto-rende-o-cdi.webp",
      alt: "Professor Bento, um professor idoso de cardigã verde e gravata-borboleta dourada, em uma sala de aula clara, segurando uma régua de madeira, com um ábaco sobre a mesa.",
    },
    content: `# Quanto rende o CDI

CDI é a taxa dos empréstimos que os bancos fazem entre si, de um dia para o outro. A B3 calcula essa taxa (a taxa DI); o Banco Central publica a série anualizada, base 252 dias úteis, no SGS com o código 4389.

Ela anda **quase colada na Selic**. Quando o Copom sobe ou corta a taxa básica, o CDI acompanha a poucos centésimos de distância, em geral um pouco abaixo. Por isso um CDB de "100% do CDI" rende, na prática, muito perto da Selic — e "110% do CDI" rende um pouco mais do que isso.

Esse texto é educativo e não é recomendação de investimento. Taxas mudam. Confira o valor vigente antes de decidir.

## Quanto está pagando agora

Na reunião de 3 e 4 de novembro de 2026, o [Copom manteve a Selic em 13,75% ao ano](https://www.bcb.gov.br/controleinflacao/comunicadoscopom/cronologicos). O CDI anualizado (SGS 4389) estava em **13,65% ao ano** na última observação útil disponível, em 19 de novembro de 2026 — a sexta-feira 20/11 foi feriado em vários estados, e este texto foi atualizado no domingo 22/11.

Uma conta simples, só para dimensionar, com R$ 10.000 aplicados por 12 meses à taxa de 13,65% a.a. (aproximação, sem capitalização diária):

- **100% do CDI:** cerca de R$ 1.365 brutos.
- **110% do CDI:** cerca de R$ 1.502 brutos.

O valor líquido depende do imposto, e o imposto depende do prazo. A calculadora do Ordre usa a taxa vigente do Banco Central, então o número na tela pode já ser outro amanhã.

## O imposto muda o jogo

CDB, Tesouro e a maior parte dos fundos de renda fixa têm **IR regressivo**, retido na fonte:

| Prazo | Alíquota |
|---|---|
| Até 180 dias | 22,5% |
| 181 a 360 dias | 20% |
| 361 a 720 dias | 17,5% |
| Acima de 720 dias | 15% |

Para um prazo de **um ano** (361 a 720 dias), a alíquota é **17,5%**, não 15%. Os 15% valem só depois de dois anos.

LCI, LCA e a poupança são **isentas** de Imposto de Renda para pessoa física, nas regras vigentes em novembro de 2026 (Lei 11.033/2004). A Medida Provisória 1.303/2025 chegou a prever tributação para alguns desses papéis, mas **perdeu a validade em 8 de outubro de 2025**, sem virar lei. Isso pode mudar no futuro; a regra que vale é a da lei em vigor.

Por isso uma LCI de 90% ou 95% do CDI pode, no líquido, ganhar de um CDB de 100% — e pode perder, conforme o prazo e a taxa. A comparação certa é sempre no **líquido**, no mesmo prazo.

## A conta que muita gente erra

Uma LCI de 95% do CDI, isenta, equivale a um CDB de:

- **cerca de 115% do CDI** num prazo de um ano (IR de 17,5%): 0,95 ÷ 0,825 ≈ 1,1515.
- **cerca de 112% do CDI** num prazo de mais de dois anos (IR de 15%): 0,95 ÷ 0,85 ≈ 1,118.

O artigo anterior deste blog usava ~112% para o prazo de um ano. Esse número é o do prazo longo, não o de 12 meses.

No exemplo dos R$ 10.000 por 12 meses, com CDI em 13,65% (aproximação):

- CDB de 100% do CDI, líquido de 17,5%: cerca de R$ 1.126.
- LCI de 95% do CDI, isenta: cerca de R$ 1.297.

A LCI costuma ter **carência** (não é liquidez diária). O CDB pode ser de liquidez diária ou ter vencimento travado, e só os produtos elegíveis entram na cobertura do [FGC](https://www.fgc.org.br/sobre-garantia-fgc) (até R$ 250 mil por CPF por instituição, com teto global de R$ 1 milhão a cada quatro anos). Tesouro Selic não usa FGC: a garantia é do governo federal.

## Como usar o CDI no dia a dia

- "100% do CDI" não é o mesmo rendimento líquido para todo mundo: prazo e tipo de papel mudam o resultado.
- Compare sempre papéis no **mesmo prazo** e no **líquido de IR**.
- Uma taxa prefixada alta só é boa se você entender o risco de crédito e a liquidez. Promessa de retorno fixo bem acima do CDI, "sem risco", pede o filtro de [como investir com segurança](/blog/investir-com-seguranca).
- A [taxa Selic](/blog/taxa-selic) é a origem da movimentação. O CDI é a régua que o mercado usa para remunerar o CDB, a LCI e boa parte dos fundos DI.

Na [Academia Ordre](/app/escola), a aula 12 ("O que é a taxa Selic") liga Selic, CDI e o custo do dinheiro no seu orçamento. A aula 8 trata do perfil de investidor, que entra na escolha entre liquidez e prazo.

## No Ordre

A faixa de indicadores do painel mostra o CDI e a Selic atuais, com dados da API do Banco Central, para todos os usuários. A calculadora "Rendimento do CDI" aplica a taxa vigente e calcula o líquido de IR para CDB e para papéis isentos, no prazo que você escolher. O módulo de Investimentos registra a carteira por classe; o Assistente tira dúvidas sobre os seus números e não recomenda ativo.

---
*Fontes: Banco Central do Brasil, [SGS série 4389](https://www3.bcb.gov.br/sgspub/) (CDI anualizado, base 252; valor de 13,65% a.a. em 19/11/2026) e [comunicados do Copom](https://www.bcb.gov.br/controleinflacao/comunicadoscopom/cronologicos) (Selic em 13,75% a.a. na 282ª reunião, 4/11/2026). Receita Federal, tabela regressiva de IR em aplicações de renda fixa (Lei 11.033/2004). FGC, regras de cobertura. Atualizado em 22/11/2026. Conteúdo educativo, não é recomendação de investimento. Confira a taxa e a lei vigentes antes de aplicar.*`,
  },
  {
    slug: "como-calcular-porcentagem",
    title: "Como calcular porcentagem sem decorar fórmula",
    excerpt:
      "Quanto é 15% de 240? Um valor subiu de 80 para 95, quantos por cento? Três operações resolvem quase tudo.",
    author: "Time Ordre",
    publishedAt: "2026-09-11",
    readingMinutes: 3,
    tags: ["conceitos", "iniciante"],
    category: "Conceitos e indicadores",
    calc: "porcentagem",
    content: `# Como calcular porcentagem

Três operações cobrem quase todo problema do dia a dia.

## 1. Quanto é X% de Y

Multiplique Y pela porcentagem dividida por 100. 15% de 240 → 240 × 0,15 = **36**

## 2. X representa quantos % de Y

Divida X por Y e multiplique por 100. 45 de 180 → 45 ÷ 180 × 100 = **25%**

## 3. Variação de X para Y

(Y − X) ÷ X × 100. De 80 para 95 → **+18,75%**. De 200 para 150 → **−25%**

## Atalhos mentais

- 10% = divida por 10. 5% = metade disso. 20% = dobro.
- Subir 10% e depois cair 10% **não** volta ao início: 100 → 110 → 99.
- "50% + 20% de desconto" não é 70%: é 100 → 50 → 40, ou seja 60%.

## No Ordre

A calculadora de Porcentagem faz as três operações. Útil para juros, descontos e rateio de despesas.

---
*Referência: aritmética elementar.*`,
  },
  {
    slug: "conversao-de-moedas",
    title: "Câmbio: dólar comercial, turismo, IOF e spread",
    excerpt:
      "Por que o dólar que você paga é sempre maior que o do noticiário — e como estimar o custo real de uma compra em moeda estrangeira.",
    author: "Time Ordre",
    publishedAt: "2026-09-12",
    readingMinutes: 4,
    tags: ["câmbio", "iniciante"],
    category: "Conceitos e indicadores",
    calc: "moedas",
    content: `# Câmbio: o que você paga de verdade

## Comercial x turismo

O **dólar comercial** é a cotação de grandes operações e do noticiário. O **turismo** é o de papel-moeda e costuma vir mais caro. Cartão internacional usa o **comercial + IOF + spread** do banco.

## Os custos que se somam

- **IOF:** incide sobre compras no cartão e saques no exterior (a alíquota vigente pode mudar por decreto).
- **Spread:** a diferença que a casa de câmbio/banco embute. De ~1% em corretoras a 4%+ em bancos de varejo.

## Estimando o custo real

Compra de US$ 100 com dólar comercial a R$ 5,00:

- Base: R$ 500
- + IOF 3,5%: R$ 17,50
- + spread 2%: R$ 10
- **Total ≈ R$ 527,50** — dólar efetivo de R$ 5,27

## No Ordre

O conversor de moedas usa a cotação comercial atualizada. Some IOF e spread por fora para o custo real.

---
*Fonte: regras de IOF da Receita Federal; cotações comerciais de mercado.*`,
  },
  {
    slug: "converter-criptomoedas",
    title: "Converter cripto: preço à vista, volatilidade e imposto",
    excerpt:
      "Quanto vale 1 BTC em real, por que o preço muda a cada segundo e quando a Receita cobra imposto sobre cripto.",
    author: "Time Ordre",
    publishedAt: "2026-09-13",
    readingMinutes: 4,
    tags: ["cripto", "iniciante"],
    category: "Investimentos",
    calc: "cripto",
    content: `# Converter criptomoedas

## Preço à vista

Cripto não tem "cotação de fechamento" — negocia 24/7 em centenas de corretoras. O preço de referência é a **média ponderada** entre as maiores. Pequenas diferenças entre exchanges são normais.

## Volatilidade

Bitcoin já subiu e caiu 10% no mesmo dia várias vezes. Para conversão pontual (pagar algo, resgatar), o que importa é o preço **naquele instante** — não a média do mês.

## Imposto no Brasil

- Vendas de cripto que **somam até R$ 35.000 no mês** são isentas de IR sobre o ganho.
- Acima disso: **15%** sobre o lucro (alíquota maior para valores muito altos).
- Você declara a posição na ficha de bens, mesmo sem vender.

## No Ordre

O conversor de cripto traz o preço à vista de BTC, ETH e outras em real e dólar, atualizado a cada poucos minutos.

---
*Fonte: Instrução Normativa RFB 1.888/2019 e atualizações; preços de mercado à vista.*`,
  },
  {
    slug: "calcular-dividendos",
    title: "Dividend yield e yield on cost: a matemática da renda passiva",
    excerpt:
      "Dividend yield mede o retorno em proventos sobre o preço atual. Yield on cost, sobre o que você pagou. A segunda é a que cresce com o tempo.",
    author: "Time Ordre",
    publishedAt: "2026-09-14",
    readingMinutes: 5,
    tags: ["dividendos", "investimentos"],
    category: "Investimentos",
    calc: "dividendos",
    content: `# Dividend yield e yield on cost

## Dividend yield (DY)

Proventos dos últimos 12 meses ÷ preço atual. Ação a R$ 30 que pagou R$ 2,40 no ano → DY de **8%**.

É uma foto do momento: se o preço sobe, o DY cai (mesmo provento, base maior).

## Yield on cost (YoC)

Proventos ÷ **preço que você pagou**. Se comprou a R$ 15 e ela ainda paga R$ 2,40, seu YoC é **16%** — o dobro de quem compra hoje. Empresas que aumentam proventos fazem o YoC subir sozinho.

## Renda estimada

R$ 50.000 numa carteira com DY médio de 8% → R$ 4.000 por ano ≈ **R$ 333 por mês**.

## Cuidados

- DY muito alto (15%+) às vezes é armadilha: preço caiu porque o mercado espera corte no provento.
- FIIs distribuem quase todo o resultado; ações retêm parte para crescer. Comparar os dois só pelo DY engana.

## No Ordre

A calculadora de Dividendos estima sua renda passiva pelo yield informado e mostra o yield on cost se você preencher o preço médio.

---
*Referência: conceitos de análise de dividendos; dados de proventos das companhias.*`,
  },
  {
    slug: "tipos-de-investimento",
    title: "Guia do iniciante: renda fixa x renda variável",
    excerpt:
      "Todo investimento cabe em duas caixas. Entender a diferença é o primeiro passo para montar uma carteira que faz sentido.",
    author: "Time Ordre",
    publishedAt: "2026-09-15",
    readingMinutes: 5,
    tags: ["iniciante", "investimentos"],
    category: "Comece aqui",
    content: `# Renda fixa x renda variável

## Renda fixa

Você empresta dinheiro (para o governo, um banco ou uma empresa) e recebe de volta com juros. A **regra de remuneração é conhecida na hora da compra** — pode ser um percentual fixo (prefixado), o CDI/Selic (pós-fixado) ou inflação + um spread (IPCA+).

Exemplos: Tesouro Direto, CDB, LCI, LCA, debênture.

O valor pode oscilar antes do vencimento (marcação a mercado), mas se você segura até o fim, recebe o combinado.

## Renda variável

Você vira sócio ou cotista de um ativo cujo preço **muda todo dia** conforme oferta e demanda. Não há retorno garantido — pode ganhar muito mais que a renda fixa, ou perder.

Exemplos: ações, fundos imobiliários, ETFs, criptomoedas.

## Como pensar a divisão

Uma abordagem comum:

- **Reserva de emergência e objetivos de curto prazo (até 2 anos):** 100% renda fixa líquida.
- **Objetivos de médio e longo prazo:** mistura, com o peso em renda variável crescendo quanto mais longo o prazo e maior sua tolerância a oscilação.

O seu **perfil de investidor** (conservador, moderado, arrojado) ajuda a definir esse peso.

## No Ordre

O quiz de perfil de investidor sugere uma divisão. O módulo de Investimentos acompanha quanto você tem em cada classe.

---
*Referência: material educacional da B3 e da CVM sobre classes de ativos.*`,
  },
  {
    slug: "tesouro-direto",
    title: "Tesouro Direto: Selic, Prefixado e IPCA+ explicados",
    excerpt:
      "O investimento mais seguro do país tem três sabores. Cada um serve para um objetivo diferente — e o Tesouro Selic, apesar de estável, não é imune a uma variação pequena no resgate antecipado.",
    author: "Time Ordre",
    publishedAt: "2026-09-16",
    readingMinutes: 5,
    tags: ["renda fixa", "iniciante"],
    category: "Investimentos",
    coverImage: {
      src: "/blog/tesouro-direto.webp",
      alt: "Professor Bento, um professor idoso de cardigã verde e gravata-borboleta dourada, em uma sala de aula clara, apresentando três blocos de madeira em tons de verde e creme.",
    },
    content: `# Tesouro Direto: Selic, Prefixado e IPCA+ explicados

Comprar um título público no Tesouro Direto é emprestar dinheiro ao governo federal. No Brasil, esse é o emissor de menor risco de crédito: o Tesouro Nacional. Você acessa pelo [site do Tesouro Direto](https://www.tesourodireto.com.br/) ou pela corretora, em geral a partir de cerca de R$ 30 (o mínimo é uma fração do título, e o valor varia).

Esse texto é educativo e não é recomendação de investimento. Não indica qual título comprar, nem em qual vencimento.

## Tesouro Selic

Rende a taxa Selic, a taxa básica definida pelo [Copom](/blog/taxa-selic). Em 4 de novembro de 2026 a meta da Selic estava em **13,75% ao ano**; o rendimento do título acompanha essa taxa ao longo do tempo, descontados custos e imposto.

É o título mais usado para [reserva de emergência](/blog/reserva-de-emergencia-6-ou-12-meses) porque a marcação a mercado é pequena e a liquidez é em **D+1** (o dinheiro cai no dia útil seguinte).

Uma correção importante: **não é verdade que o Tesouro Selic "não sofre perda" se resgatado antes do vencimento**. O Tesouro recompra pelo preço de mercado. Em prazos muito curtos pode haver uma variação negativa pequena, por causa da marcação a mercado e do spread entre compra e venda. Imposto de renda e, em resgates com menos de 30 dias, IOF também reduzem o valor líquido. O risco é baixo em comparação com o Prefixado e o IPCA+, mas não é zero.

## Tesouro Prefixado

A taxa é travada na compra (por exemplo, "12,5% ao ano"). Se você **segura até o vencimento**, recebe exatamente essa taxa, menos os custos e o IR. Se vender antes e os juros do mercado tiverem subido, o preço do título cai — e aí **pode haver prejuízo**. Se os juros tiverem caído, o preço sobe.

Serve para quem tem uma data certa e pretende carregar o título até o fim. Não é o melhor lugar para a reserva, justamente porque o preço oscila.

## Tesouro IPCA+

Paga a **inflação medida pelo IPCA mais um percentual fixo** (por exemplo, "IPCA + 6%"). Se carregado até o vencimento, protege o poder de compra: o principal é corrigido pelo [IPCA](/blog/tipos-de-inflacao) e ainda há o juro real combinado.

Também sofre marcação a mercado se vendido antes do vencimento. Quanto maior o prazo, maior a oscilação do preço quando a taxa de juro real muda. Por isso costuma aparecer em objetivos longos — aposentadoria, independência financeira, uma meta daqui a 10 anos ou mais — e não na reserva.

Há ainda o Tesouro Renda+ e o Tesouro Educa+, pensados para converter o saldo em pagamentos periódicos no futuro. A lógica de risco é parecida com a de um título longo atrelado à inflação: até a conversão, o preço oscila.

## Custos e imposto

- **Taxa de custódia da B3:** 0,20% ao ano, proporcional ao prazo. No Tesouro Selic, há isenção sobre os primeiros **R$ 10 mil por CPF**; a taxa incide só sobre o que passar disso. Confirme a [tabela vigente na B3](https://www.b3.com.br/pt_br/produtos-e-servicos/tarifas/tarifas-de-tesouro-direto/), porque esse valor já mudou no passado.
- Algumas corretoras cobram taxa própria; muitas hoje cobram zero.
- **IR regressivo** de 22,5% a 15% sobre o rendimento, conforme o prazo (a mesma tabela da [renda fixa](/blog/imposto-de-renda-investimentos)). O imposto é recolhido no vencimento, no pagamento de juros ou no resgate — não há come-cotas.
- Resgate em menos de 30 dias pode ter IOF, como nas demais aplicações de renda fixa.

## Qual título combina com qual objetivo

Não existe título "melhor" no abstrato. Existe título alinhado a um prazo e a um uso.

| Objetivo | Caminho mais coerente | Por quê |
|---|---|---|
| Reserva de emergência | Tesouro Selic | Liquidez em D+1 e baixa oscilação |
| Meta com data em 2 a 5 anos, que você consegue carregar até o fim | Prefixado | Taxa travada, se não vender antes |
| Aposentadoria ou meta muito longa | IPCA+ (ou Renda+) | Protege o poder de compra |
| Dinheiro que pode ser preciso este mês | Tesouro Selic, não Prefixado nem IPCA+ longo | Evita vender no meio de uma oscilação |

Se a Selic cair, o Tesouro Selic passa a render menos daí para a frente — isso é o desenho do título, não um defeito. Prefixado e IPCA+ já comprados até o vencimento mantêm a taxa combinada; o preço deles, se você quiser vender no meio do caminho, reage à Selic nova.

Na [Academia Ordre](/app/escola), a aula 12 explica a Selic e o CDI, que são a referência do Tesouro Selic e de boa parte da renda fixa. A aula 7 trata da reserva. A aula 13, da regra dos 4% e do patrimônio para viver de renda — cenário em que o IPCA+ costuma entrar na conversa, sem ser o único caminho.

## No Ordre

A faixa de indicadores do painel mostra Selic, CDI e IPCA acumulado em 12 meses, com dados do Banco Central, para todos os usuários. A calculadora de [Rendimento do CDI](/app/calculadoras?c=cdi) ajuda a comparar um título pós-fixado com um papel isento, no líquido. O módulo de Investimentos registra o que você já tem em renda fixa, ações, FIIs, ETFs, cripto e caixa, e o quiz de perfil sugere uma divisão-alvo — é sugestão do app, não uma regra oficial. O Assistente tira dúvidas sobre os seus números e não recomenda título.

---
*Fontes: [Tesouro Nacional — Tesouro Direto](https://www.tesourodireto.com.br/) (regras, tipos de título e recompra pelo preço de mercado). [B3, tarifas do Tesouro Direto](https://www.b3.com.br/pt_br/produtos-e-servicos/tarifas/tarifas-de-tesouro-direto/) (custódia de 0,20% a.a. e isenção dos primeiros R$ 10 mil em Tesouro Selic, conferidas em 22/11/2026). Banco Central do Brasil, [Copom](https://www.bcb.gov.br/controleinflacao/comunicadoscopom/cronologicos) (Selic em 13,75% a.a. em 4/11/2026). Receita Federal, tabela regressiva de IR. Atualizado em 22/11/2026. Conteúdo educativo, não é recomendação de investimento.*`,
  },
  {
    slug: "fundos-imobiliarios",
    title: "Fundos imobiliários (FIIs): renda de aluguel sem comprar imóvel",
    excerpt:
      "Com uma cota de ~R$ 100 você vira sócio de shoppings, galpões e prédios — e recebe a parte dos aluguéis todo mês, isenta de IR.",
    author: "Time Ordre",
    publishedAt: "2026-09-17",
    readingMinutes: 6,
    tags: ["iniciante", "investimentos"],
    category: "Investimentos",
    content: `# Fundos imobiliários (FIIs)

Um FII junta o dinheiro de milhares de cotistas e investe em imóveis ou em dívida imobiliária. Você compra cotas na bolsa, como se fossem ações.

## O que você ganha

- **Rendimento mensal:** a maior parte do resultado é distribuída aos cotistas. Para pessoa física, esse rendimento é **isento de IR** (se o fundo cumpre requisitos legais).
- **Valorização (ou desvalorização) da cota.**

## Tipos

- **Tijolo:** imóveis físicos — lajes corporativas, shoppings, galpões logísticos, hospitais. Renda vem do aluguel.
- **Papel (recebíveis):** compram dívida imobiliária (CRI). Renda vem dos juros, costuma acompanhar CDI ou IPCA.
- **Fundos de fundos (FoF):** investem em cotas de outros FIIs. Diversificação num só ticket.

## Riscos

- **Vacância:** imóvel vazio não paga aluguel.
- **Volatilidade:** a cota oscila todo dia.
- **Ganho de capital na venda é tributado em 20%** (só o lucro da venda, não o rendimento mensal).

## Como avaliar (básico)

- Dividend yield sustentável (desconfie de 15%+ sem motivo).
- P/VP (preço sobre valor patrimonial): perto de 1 é "justo".
- Qualidade dos imóveis e dos inquilinos, prazo dos contratos.

---
*Fonte: Lei 8.668/1993 e Lei 11.196/2005 (isenção); material educacional da B3.*`,
  },
  {
    slug: "acoes-o-que-sao",
    title: "Ações: o que são e como comprar a primeira",
    excerpt:
      "Comprar uma ação é comprar um pedacinho de uma empresa. Veja o que muda entre ON e PN e o passo a passo para investir.",
    author: "Time Ordre",
    publishedAt: "2026-09-18",
    readingMinutes: 5,
    tags: ["iniciante", "investimentos"],
    category: "Investimentos",
    content: `# Ações

Uma ação é uma fração do capital de uma empresa. Ao comprar, você vira sócio — participa dos lucros (via dividendos) e da valorização (ou queda) do preço.

## ON, PN e Unit

- **ON (ordinária):** dá direito a voto na assembleia. Ticker termina em **3** (ex.: PETR3).
- **PN (preferencial):** sem voto, mas prioridade no recebimento de dividendos. Ticker termina em **4** (ex.: PETR4).
- **Unit:** pacote de ON + PN. Termina em **11** (ex.: SANB11).

## Como comprar

1. Abrir conta numa corretora (gratuita na maioria).
2. Transferir dinheiro via PIX/TED.
3. No home broker, buscar o ticker e enviar uma **ordem de compra** (a mercado ou limitada a um preço).
4. A liquidação é em **D+2** (as ações aparecem 2 dias úteis depois).

## Custos

- Corretagem: R$ 0 na maioria das corretoras para ações.
- Emolumentos da B3: ~0,03%.
- IR: **15% sobre o lucro** no swing trade, com isenção se as vendas do mês somam até R$ 20.000. Day trade: 20%, sem isenção.

## Primeiro passo sensato

Muitos iniciantes começam por um **ETF** (ex.: um que replica o Ibovespa) — uma cesta de dezenas de ações num só papel, com diversificação instantânea.

---
*Fonte: manual do investidor da B3; regras de IR da Receita Federal.*`,
  },
  {
    slug: "como-analisar-acoes",
    title: "Como analisar uma ação: os indicadores que importam",
    excerpt:
      "P/L, ROE, dívida líquida, dividend yield. O que cada número diz sobre a empresa — e por que nenhum funciona sozinho.",
    author: "Time Ordre",
    publishedAt: "2026-09-19",
    readingMinutes: 7,
    tags: ["investimentos", "análise"],
    category: "Investimentos",
    content: `# Como analisar uma ação

Análise fundamentalista olha para a **empresa por trás do papel**: ela lucra, cresce, se endivida bem?

## Indicadores de preço

- **P/L (preço/lucro):** quantos anos de lucro atual para "pagar" a ação. P/L 8 é mais barato que P/L 20 — mas empresas que crescem rápido merecem P/L maior.
- **P/VP (preço/valor patrimonial):** abaixo de 1 = negociando abaixo do patrimônio contábil.

## Indicadores de qualidade

- **ROE (retorno sobre patrimônio):** quanto de lucro a empresa gera sobre o capital dos sócios. Acima de 15% costuma ser bom e consistente é melhor que alto num ano só.
- **Margem líquida:** quanto do faturamento vira lucro.

## Endividamento

- **Dívida líquida / EBITDA:** acima de 3x acende alerta (depende do setor).

## Dividendos

- **Dividend yield** e histórico de pagamento. Consistência > pico isolado.

## A regra de ouro

Nenhum indicador funciona sozinho. Uma ação "barata" no P/L pode estar barata porque o lucro vai cair. Cruze os números com: o setor, o histórico de 5–10 anos, a vantagem competitiva e a qualidade da gestão.

## No Ordre

O foco do Ordre é o **seu** patrimônio consolidado, não a análise de ativos individuais. Para estudar empresas, use as demonstrações financeiras (site de RI) e ferramentas dedicadas.

---
*Referência: conceitos de análise fundamentalista (Graham, "O Investidor Inteligente"; material da APIMEC).*`,
  },
  {
    slug: "investir-no-exterior",
    title: "Investir no exterior: stocks, ETFs e BDRs",
    excerpt:
      "Dá para ter Apple e S&P 500 na carteira sem abrir conta lá fora. Veja os três caminhos e o risco que ninguém conta: o câmbio.",
    author: "Time Ordre",
    publishedAt: "2026-09-20",
    readingMinutes: 2,
    tags: ["iniciante", "investimentos"],
    category: "Investimentos",
    content: `# Investir no exterior

Diversificar para fora do Brasil reduz o risco de depender de uma única economia e moeda.

## Três caminhos

1. **BDR (Brazilian Depositary Receipt):** recibo negociado na B3 que representa uma ação estrangeira (ex.: AAPL34 = Apple). Compra em reais, pela sua corretora brasileira, no horário da bolsa daqui.
2. **ETF de índice internacional na B3:** ex.: um ETF que replica o S&P 500, cotado em reais.
3. **Conta em corretora internacional:** compra ações e ETFs diretamente em dólar. Mais opções, mais burocracia (declaração, câmbio).

## O risco cambial

Se você compra um ativo em dólar e o real **se valoriza**, seu retorno em reais encolhe — mesmo que o ativo tenha subido lá fora. O contrário também vale. Câmbio é uma fonte de risco *e* de proteção.

## Imposto

- **BDR e ETF na B3:** 15% sobre o ganho de capital, sem a isenção de R$ 20 mil das ações à vista.
- **Aplicações financeiras no exterior:** desde o ano-calendário de 2024, a [Lei 14.754/2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14754.htm) tributa rendimentos de investimentos financeiros mantidos lá fora — ganho de capital e dividendos desses investimentos — na declaração anual, em regra à alíquota de **15%**. A apuração é anual, fora do carnê-leão mensal e fora da tabela progressiva do ganho de capital. Renda no exterior de outra natureza, como aluguel, pode seguir regra diferente. Confirme o enquadramento no ano-calendário.

## Quanto alocar

Não há número mágico. Muitos investidores de longo prazo colocam entre **10% e 30%** da carteira de renda variável no exterior.

---
*Fonte: Resolução CVM 3/2020 (BDR); Lei 14.754/2023 e regras de tributação da Receita Federal. Confirme alíquotas no ano-calendário.*`,
  },
  {
    slug: "criptomoedas-basico",
    title: "Criptomoedas para quem está começando",
    excerpt:
      "Blockchain, carteira, exchange, custódia. O mínimo que você precisa entender antes de comprar seu primeiro satoshi — e por que alocar pouco.",
    author: "Time Ordre",
    publishedAt: "2026-09-21",
    readingMinutes: 6,
    tags: ["iniciante", "cripto"],
    category: "Investimentos",
    content: `# Criptomoedas para quem está começando

## O que é

Cripto é dinheiro digital que roda numa **blockchain** — um registro público, distribuído entre milhares de computadores, que ninguém controla sozinho. Bitcoin é a maior; Ethereum adiciona "contratos inteligentes".

## Onde fica guardada

- **Exchange (corretora):** prático, mas a corretora tem a chave. Se ela quebra ou é hackeada, o risco é seu. Escolha exchanges grandes e reguladas.
- **Carteira própria (self-custody):** você guarda a "seed phrase" (12–24 palavras). Controle total — e responsabilidade total. Perdeu a frase, perdeu tudo.

## Os riscos reais

- **Volatilidade:** quedas de 50%+ já aconteceram várias vezes.
- **Golpes:** promessas de rendimento fixo, "airdrops", suporte falso. Se parece bom demais, é golpe.
- **Sem garantia:** não existe FGC nem Tesouro por trás.

## Imposto

Vendas que somam **até R$ 35.000 no mês** são isentas de IR sobre o ganho. Acima disso, 15% sobre o lucro. Você declara a posição mesmo sem vender.

## Alocação sensata

Trate como a parte mais arriscada da carteira. Uma faixa comum entre investidores é **1% a 5%** do total — o quanto você aguentaria ver cair pela metade sem perder o sono.

---
*Fonte: Instrução Normativa RFB 1.888/2019; documentação técnica de Bitcoin e Ethereum.*`,
  },
  {
    slug: "rentabilidade",
    title: "Rentabilidade: nominal, real e como comparar de verdade",
    excerpt:
      "Rendeu 12%? Pode ter perdido dinheiro. Entenda a diferença entre retorno nominal e real e como comparar aplicações no mesmo pé.",
    author: "Time Ordre",
    publishedAt: "2026-09-22",
    readingMinutes: 5,
    tags: ["conceitos", "iniciante"],
    category: "Conceitos e indicadores",
    calc: "juros",
    content: `# Rentabilidade

Rentabilidade é o quanto um investimento cresceu, em percentual, num período.

## Nominal x real

- **Nominal:** o número que aparece no extrato. "Rendeu 12% no ano."
- **Real:** o nominal **descontada a inflação**. Se a inflação foi 5%, o ganho real foi ≈ 6,7% (não 7% — a conta é multiplicativa: 1,12 ÷ 1,05 − 1).

O que importa para o poder de compra é o **real**. Um CDB que rende 8% com inflação a 8% não te deixou mais rico.

## Comparando aplicações

Coloque tudo na mesma base:

1. **Mesmo período** (converta tudo para "ao ano").
2. **Líquido de imposto** (aplique a alíquota de IR conforme o tipo e o prazo).
3. **Líquido de taxas** (taxa de administração de fundo, custódia).

Só então compare. Uma LCI de 90% do CDI isenta pode ganhar de um CDB de 100% do CDI.

## Rentabilidade passada não é garantia

Fundo que rendeu 30% ano passado pode render −10% neste. Histórico serve para entender consistência e risco, não para prever.

## No Ordre

A calculadora de Juros compostos projeta a rentabilidade dos seus aportes. O módulo de Investimentos mostra o ganho de cada ativo (valor atual − investido).

---
*Referência: conceito de retorno real (equação de Fisher); tabela de IR da Receita Federal.*`,
  },
  {
    slug: "taxa-selic",
    title: "Taxa Selic: o que é e como ela mexe no seu bolso",
    excerpt:
      "A Selic é o preço do dinheiro no Brasil. Quando sobe, sua renda fixa rende mais e o crédito fica mais caro. Quando cai, o contrário.",
    author: "Time Ordre",
    publishedAt: "2026-09-23",
    readingMinutes: 5,
    tags: ["conceitos", "indicadores"],
    category: "Conceitos e indicadores",
    calc: "cdi",
    content: `# Taxa Selic

A Selic é a taxa básica de juros da economia, definida a cada 45 dias pelo Comitê de Política Monetária (Copom) do Banco Central.

## Para que serve

É a principal ferramenta para controlar a inflação. Inflação alta → o BC **sobe** a Selic → crédito encarece → consumo esfria → preços desaceleram. Inflação sob controle → o BC pode **baixar**.

## Como isso chega até você

| Selic sobe | Selic cai |
|---|---|
| Renda fixa pós-fixada rende mais | Renda fixa rende menos |
| Financiamento, cartão e cheque especial encarecem | Crédito fica mais barato |
| Bolsa tende a cair (renda fixa fica mais atrativa) | Bolsa tende a subir |
| Real tende a se valorizar | Real tende a enfraquecer |

## Selic x CDI

O **CDI** é a taxa dos empréstimos entre bancos e anda praticamente colada na Selic (poucos centésimos abaixo). Por isso "rende 100% do CDI" ≈ "rende a Selic".

## No Ordre

A faixa de indicadores no seu painel mostra a Selic e o CDI atuais. A calculadora "Rendimento do CDI" usa a taxa vigente do Banco Central.

---
*Fonte: Banco Central do Brasil — Copom e série histórica da Selic.*`,
  },
  {
    slug: "tipos-de-inflacao",
    title: "IPCA, IGP-M e os índices de inflação que afetam sua vida",
    excerpt:
      "A inflação oficial (IPCA) reajusta salários e metas do BC. O IGP-M reajusta aluguel. Saber qual é qual evita surpresa no boleto.",
    author: "Time Ordre",
    publishedAt: "2026-09-24",
    readingMinutes: 5,
    tags: ["conceitos", "indicadores"],
    category: "Conceitos e indicadores",
    content: `# Os índices de inflação

Inflação é a perda de poder de compra do dinheiro ao longo do tempo. No Brasil, vários índices medem isso de formas diferentes.

## IPCA — a inflação oficial

Calculado pelo IBGE, mede o custo de vida de famílias com renda de 1 a 40 salários mínimos. É a **meta do Banco Central** e a referência para o Tesouro IPCA+ e para reajuste de muitos salários.

## IGP-M — o "inflação do aluguel"

Calculado pela FGV, pesa muito preços no atacado e o dólar. É bem mais volátil que o IPCA e tradicionalmente reajusta **contratos de aluguel** e algumas tarifas.

## INPC

Parecido com o IPCA, mas foca em famílias de renda mais baixa (1 a 5 salários). Usado em vários acordos trabalhistas.

## Por que isso importa para investir

- Investimento que rende **abaixo da inflação** te empobrece em termos reais.
- Tesouro IPCA+ e alguns CDBs pagam "inflação + spread" — protegem o poder de compra.
- Renda fixa prefixada é uma **aposta**: você ganha se a inflação vier abaixo do embutido no preço.

## No Ordre

O painel mostra o IPCA acumulado em 12 meses. Use como piso: seus investimentos precisam render acima disso para valer a pena.

---
*Fonte: IBGE (IPCA, INPC); FGV (IGP-M).*`,
  },
  {
    slug: "previdencia-privada",
    title: "Previdência privada: PGBL, VGBL e quando realmente vale",
    excerpt:
      "Previdência não é mágica — é um fundo com regra de imposto diferente. Veja quando o PGBL compensa e a armadilha da tabela progressiva.",
    author: "Time Ordre",
    publishedAt: "2026-09-25",
    readingMinutes: 6,
    tags: ["investimentos", "aposentadoria"],
    category: "Investimentos",
    calc: "fire",
    content: `# Previdência privada

Um plano de previdência (PGBL ou VGBL) é, no fundo, um fundo de investimento com **tributação e sucessão** diferentes.

## PGBL x VGBL

- **PGBL:** você pode **deduzir os aportes** da base do Imposto de Renda, até 12% da renda bruta tributável. Só vale se você **declara no modelo completo**. Na retirada, o IR incide sobre **todo o valor** (aporte + rendimento).
- **VGBL:** sem dedução. Na retirada, o IR incide **só sobre o rendimento**. Melhor para quem faz declaração simplificada ou já estourou os 12%.

## As duas tabelas de IR

- **Progressiva:** de 0% a 27,5%, como o salário. Boa se você vai resgatar pouco por mês.
- **Regressiva:** começa em 35% e cai até **10% após 10 anos**. Melhor para o longo prazo — e a escolha padrão para aposentadoria.

## Cuidados

- **Taxa de administração** alta (acima de ~1% a.a.) come o benefício fiscal. Compare.
- **Taxa de carregamento** (sobre cada aporte) deveria ser zero hoje.
- Portabilidade entre planos é possível sem pagar IR.

## Vale a pena?

Para quem declara no completo, mira o longo prazo e acha um plano com taxa baixa: sim, o PGBL + tabela regressiva é eficiente. Caso contrário, um Tesouro IPCA+ longo costuma bater um plano caro.

## No Ordre

A calculadora de Independência financeira estima o patrimônio necessário para viver de renda — some previdência, investimentos e INSS no total.

---
*Fonte: Receita Federal (regras de dedução e tabelas de IR de previdência); SUSEP.*`,
  },
  {
    slug: "fundos-de-investimento",
    title: "Fundos de investimento: tipos, taxas e o come-cotas",
    excerpt:
      "Um gestor cuida da carteira por você — cobrando por isso. Entenda taxa de administração, performance e o imposto que morde duas vezes por ano.",
    author: "Time Ordre",
    publishedAt: "2026-09-26",
    readingMinutes: 6,
    tags: ["investimentos", "fundos"],
    category: "Investimentos",
    content: `# Fundos de investimento

Um fundo junta o dinheiro de vários cotistas e um **gestor profissional** aplica conforme uma política definida. Você compra e vende **cotas**.

## Tipos principais

- **Renda fixa / DI:** seguem o CDI. Os mais conservadores.
- **Multimercado:** misturam renda fixa, ações, câmbio, juros. Estratégia livre.
- **Ações:** pelo menos 67% em ações.
- **Cambial:** seguem o dólar ou euro.

## As taxas

- **Administração:** percentual anual sobre o patrimônio (ex.: 1% a.a.), cobrado todo dia proporcionalmente. É o principal custo.
- **Performance:** parte do que exceder um referencial (ex.: 20% do que passar do CDI). Nem todo fundo cobra.

Fundo de renda fixa com taxa de administração acima de ~0,5% a.a. dificilmente ganha de um Tesouro Selic comprado direto.

## O come-cotas

Fundos de renda fixa e multimercado sofrem antecipação de IR em **maio e novembro**: o Leão "come" algumas cotas na alíquota mínima da tabela (15% ou 20%). No resgate, ajusta o restante. Fundos de ações **não** têm come-cotas (15% só na venda).

## Liquidez

Preste atenção no prazo de resgate: "D+1" (dinheiro na conta no dia seguinte) x "D+30" (trinta dias depois). Reserva de emergência só em fundo D+0/D+1.

## No Ordre

Lance suas cotas no módulo de Investimentos com o valor investido e o valor atual — o Ordre mostra o ganho e o peso na carteira.

---
*Fonte: CVM (Resolução 175); regras de come-cotas da Receita Federal.*`,
  },
  {
    slug: "etfs-como-funcionam",
    title: "ETFs: o atalho da diversificação em um único papel",
    excerpt:
      "Com uma cota você compra uma cesta inteira de ações ou títulos. Como funcionam, quanto custam e por que costumam bater fundos ativos.",
    author: "Time Ordre",
    publishedAt: "2026-09-27",
    readingMinutes: 5,
    tags: ["investimentos", "iniciante"],
    category: "Investimentos",
    content: `# ETFs

ETF (Exchange Traded Fund) é um fundo negociado na bolsa como se fosse uma ação. A maioria **replica um índice** — Ibovespa, S&P 500, IFIX, um índice de renda fixa.

## Por que usar

- **Diversificação instantânea:** uma cota de um ETF de Ibovespa te dá exposição a dezenas de empresas.
- **Custo baixo:** taxa de administração costuma ser de 0,1% a 0,5% a.a. — bem abaixo de fundos ativos.
- **Simplicidade:** você não precisa escolher ações uma a uma.

## O argumento dos índices

Estudos de longo prazo (ex.: relatórios SPIVA da S&P) mostram que **a maioria dos fundos ativos não supera seu índice** depois de taxas, em janelas de 10+ anos. Para o investidor médio, um ETF de índice amplo é um ponto de partida difícil de bater.

## Tributação

Ações via ETF: **15% sobre o ganho na venda, sem a isenção de R$ 20 mil**. ETFs de renda fixa têm regra própria (tabela regressiva no resgate).

## Cuidados

- Veja o **índice** que o ETF segue e a taxa.
- ETFs muito pequenos ou pouco negociados podem ter spread alto na hora de comprar/vender.

## No Ordre

Registre seus ETFs na classe "ETFs" do módulo de Investimentos — o gráfico de composição mostra o peso deles na carteira.

---
*Fonte: material educacional da B3; relatórios SPIVA da S&P Dow Jones Indices.*`,
  },
  {
    slug: "investir-com-seguranca",
    title: "Como investir com segurança: os 5 filtros antes de aplicar",
    excerpt:
      "Não existe investimento sem risco — existe risco que você entende e risco que te pega de surpresa. Cinco perguntas antes de clicar em 'aplicar'.",
    author: "Time Ordre",
    publishedAt: "2026-09-28",
    readingMinutes: 2,
    tags: ["iniciante", "segurança"],
    category: "Comece aqui",
    content: `# Como investir com segurança

Segurança em investimento não é "não perder nunca" — é **não ser surpreendido**. Cinco filtros antes de aplicar:

## 1. Eu entendo como esse investimento ganha dinheiro?

Se você não consegue explicar em uma frase de onde vem o retorno, não invista. Vale para "robôs de trade", "pool de liquidez" e qualquer coisa com retorno fixo alto.

## 2. Qual a garantia?

- **FGC:** cobre até **R$ 250 mil por CPF por instituição** (ou conglomerado) em CDB, LCI, LCA, poupança e outros produtos elegíveis, com **teto global de R$ 1 milhão a cada quatro anos**.
- **Tesouro Direto:** garantido pelo governo federal.
- **Ações, FIIs, cripto, debênture:** sem garantia. O risco é da empresa/ativo.

## 3. Quando vou precisar desse dinheiro?

Prazo curto → renda fixa líquida. Prazo longo → pode assumir mais oscilação. Nunca coloque a reserva de emergência em algo que oscila.

## 4. Quanto disso eu aguento ver cair?

Se 20% de queda te faria vender no desespero, sua alocação em renda variável está alta demais.

## 5. A promessa é boa demais?

Retorno fixo acima de ~1,5% ao mês, "sem risco", com pressão para entrar rápido: é golpe. Pirâmides e esquemas Ponzi usam exatamente esse roteiro.

## No Ordre

O quiz de perfil de investidor calibra quanto de risco faz sentido pra você. Os alertas do painel avisam quando a carteira sai do alvo.

---
*Fonte: [FGC — regras de cobertura](https://www.fgc.org.br/sobre-garantia-fgc); CVM e Banco Central (alertas sobre fraudes financeiras).*`,
  },
];

export function getPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}
