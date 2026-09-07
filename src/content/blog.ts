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

No Patrimo, a IA observa seu comportamento real (não só o que você declara) e sugere ajustes de carteira.

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

No Patrimo conectamos suas contas via Open Finance e as transações entram categorizadas.

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

O relatório fiscal anual resume vendas, lucros, prejuízos a compensar e preço médio.

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
  {
    slug: "juros-simples",
    title: "Juros simples vs. juros compostos: a diferença que muda tudo",
    excerpt:
      "No juros simples a taxa incide sempre sobre o valor inicial. No composto, sobre o acumulado. Em prazos longos, a diferença vira uma montanha.",
    author: "Time Patrimo",
    publishedAt: "2026-09-08",
    readingMinutes: 4,
    tags: ["conceitos", "iniciante"],
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

## No Patrimo

A calculadora de Juros compostos projeta seus aportes mês a mês. A de Juros simples serve para comparar contratos.

---
*Referência: matemática financeira padrão.*`,
  },
  {
    slug: "primeiro-milhao",
    title: "Quanto poupar por mês para chegar ao primeiro milhão",
    excerpt:
      "Não é sobre sorte nem salário alto. É aporte constante, tempo e uma taxa de retorno realista. Veja os números.",
    author: "Time Patrimo",
    publishedAt: "2026-09-09",
    readingMinutes: 5,
    tags: ["metas", "investimentos"],
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

## No Patrimo

A calculadora "Primeiro milhão" resolve para o aporte: você diz a meta, o prazo e o retorno, ela diz quanto guardar por mês. As Metas acompanham o progresso real.

---
*Referência: valor presente de série de pagamentos.*`,
  },
  {
    slug: "quanto-rende-o-cdi",
    title: "Quanto rende o CDI, e por que ele é a régua da renda fixa",
    excerpt:
      "CDB de 100% do CDI, 110%, LCI isenta... entenda o que o CDI é, quanto paga hoje e como comparar aplicações.",
    author: "Time Patrimo",
    publishedAt: "2026-09-10",
    readingMinutes: 5,
    tags: ["renda fixa", "iniciante"],
    content: `# Quanto rende o CDI

## O que é o CDI

CDI é a taxa dos empréstimos que os bancos fazem entre si, de um dia para o outro. Ela anda **quase colada na Selic**. Quando você vê "CDB paga 110% do CDI", significa 110% dessa taxa.

## Quanto rende hoje

Com o CDI em torno de **10,65% ao ano** (varia com a Selic), R$ 10.000 por 12 meses:

- **100% do CDI:** ~R$ 1.065 bruto
- **110% do CDI:** ~R$ 1.170 bruto

## O imposto muda o jogo

Renda fixa tributável (CDB, Tesouro) tem **IR regressivo**: 22,5% até 180 dias, caindo até 15% após 720 dias. LCI, LCA e poupança são **isentas** — por isso uma LCI de 90% do CDI pode render mais, no líquido, que um CDB de 100%.

## Como comparar

Sempre no **líquido**. Uma LCI de 95% do CDI isenta ≈ um CDB de ~112% do CDI para prazo de 1 ano.

## No Patrimo

A calculadora "Rendimento do CDI" traz a taxa atual do Banco Central e calcula o líquido de IR para CDB e para papéis isentos.

---
*Fonte: série 4389 do Banco Central; tabela de IR da Receita Federal.*`,
  },
  {
    slug: "como-calcular-porcentagem",
    title: "Como calcular porcentagem sem decorar fórmula",
    excerpt:
      "Quanto é 15% de 240? Um valor subiu de 80 para 95, quantos por cento? Três operações resolvem quase tudo.",
    author: "Time Patrimo",
    publishedAt: "2026-09-11",
    readingMinutes: 3,
    tags: ["conceitos", "iniciante"],
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

## No Patrimo

A calculadora de Porcentagem faz as três operações. Útil para juros, descontos e rateio de despesas.

---
*Referência: aritmética elementar.*`,
  },
  {
    slug: "conversao-de-moedas",
    title: "Câmbio: dólar comercial, turismo, IOF e spread",
    excerpt:
      "Por que o dólar que você paga é sempre maior que o do noticiário — e como estimar o custo real de uma compra em moeda estrangeira.",
    author: "Time Patrimo",
    publishedAt: "2026-09-12",
    readingMinutes: 4,
    tags: ["câmbio", "iniciante"],
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

## No Patrimo

O conversor de moedas usa a cotação comercial atualizada. Some IOF e spread por fora para o custo real.

---
*Fonte: regras de IOF da Receita Federal; cotações comerciais de mercado.*`,
  },
  {
    slug: "converter-criptomoedas",
    title: "Converter cripto: preço à vista, volatilidade e imposto",
    excerpt:
      "Quanto vale 1 BTC em real, por que o preço muda a cada segundo e quando a Receita cobra imposto sobre cripto.",
    author: "Time Patrimo",
    publishedAt: "2026-09-13",
    readingMinutes: 4,
    tags: ["cripto", "iniciante"],
    content: `# Converter criptomoedas

## Preço à vista

Cripto não tem "cotação de fechamento" — negocia 24/7 em centenas de corretoras. O preço de referência é a **média ponderada** entre as maiores. Pequenas diferenças entre exchanges são normais.

## Volatilidade

Bitcoin já subiu e caiu 10% no mesmo dia várias vezes. Para conversão pontual (pagar algo, resgatar), o que importa é o preço **naquele instante** — não a média do mês.

## Imposto no Brasil

- Vendas de cripto que **somam até R$ 35.000 no mês** são isentas de IR sobre o ganho.
- Acima disso: **15%** sobre o lucro (alíquota maior para valores muito altos).
- Você declara a posição na ficha de bens, mesmo sem vender.

## No Patrimo

O conversor de cripto traz o preço à vista de BTC, ETH e outras em real e dólar, atualizado a cada poucos minutos.

---
*Fonte: Instrução Normativa RFB 1.888/2019 e atualizações; preços de mercado à vista.*`,
  },
  {
    slug: "calcular-dividendos",
    title: "Dividend yield e yield on cost: a matemática da renda passiva",
    excerpt:
      "Dividend yield mede o retorno em proventos sobre o preço atual. Yield on cost, sobre o que você pagou. A segunda é a que cresce com o tempo.",
    author: "Time Patrimo",
    publishedAt: "2026-09-14",
    readingMinutes: 5,
    tags: ["dividendos", "investimentos"],
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

## No Patrimo

A calculadora de Dividendos estima sua renda passiva pelo yield informado e mostra o yield on cost se você preencher o preço médio.

---
*Referência: conceitos de análise de dividendos; dados de proventos das companhias.*`,
  },
];

export function getPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}
