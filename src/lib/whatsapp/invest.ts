import { PROFILE_INFO, VARIABLE_CLASSES, CLASS_LABELS } from "@/lib/investor";
import type { InvestmentClass, InvestorProfile } from "@/types/database";
import { fold } from "./text";

export const EDUCATIONAL_DISCLAIMER =
  "Aviso educativo: isto explica conceitos e compara a sua carteira com o perfil que você escolheu no Ordre. Não é recomendação de compra ou venda de ativo (Resoluções CVM 19 e 20). A decisão é sua.";

const CONCEPTS: { keys: string[]; text: string }[] = [
  {
    keys: ["selic"],
    text: "A Selic é a taxa básica de juros da economia, definida pelo Banco Central. Quando ela sobe, rende mais deixar o dinheiro em títulos pós-fixados e o crédito fica mais caro. Quando cai, acontece o contrário. Ela não diz se um papel específico é bom para você.",
  },
  {
    keys: ["cdi"],
    text: "O CDI é a taxa que os bancos usam entre si e serve de referência para a maior parte da renda fixa (CDB, fundo DI). '100% do CDI' significa acompanhar essa taxa, antes de imposto. Não é um produto: é a régua com que se compara o produto.",
  },
  {
    keys: ["ipca", "inflacao", "inflação"],
    text: "O IPCA mede a inflação oficial. Se o investimento rende menos que o IPCA, o poder de compra cai mesmo com o saldo maior. Por isso existe título atrelado à inflação (Tesouro IPCA) e a conta de rendimento real: taxa menos inflação.",
  },
  {
    keys: ["tesouro"],
    text: "Tesouro Direto é o programa de títulos públicos federais. Há prefixado (taxa travada), Selic (acompanha a taxa básica, mais líquido) e IPCA (inflação mais uma taxa). O risco de crédito é o da União. O preço dos prefixados e dos IPCA oscila antes do vencimento se você vender antes.",
  },
  {
    keys: ["cdb"],
    text: "CDB é um título de banco. Pode ser pós-fixado (um percentual do CDI), prefixado ou atrelado à inflação. Tem garantia do FGC até o limite vigente, por CPF e por instituição. A liquidez depende do contrato: diária ou só no vencimento.",
  },
  {
    keys: ["lci", "lca"],
    text: "LCI e LCA são títulos de banco ligados a crédito imobiliário e do agronegócio. Para pessoa física costumam ser isentos de imposto de renda. Em troca, o percentual do CDI oferecido às vezes é menor que o de um CDB. Também podem ter garantia do FGC, dentro do limite.",
  },
  {
    keys: ["fii", "fiis"],
    text: "FII é um fundo que reúne investidores para aplicar em imóveis ou em dívidas imobiliárias. A cota é negociada em bolsa e o valor oscila. Muitos distribuem rendimento periódico, que não é garantido. Não é aluguel de um imóvel seu: é uma cota, com taxa e risco do fundo.",
  },
  {
    keys: ["etf"],
    text: "ETF é um fundo negociado em bolsa que segue um índice (de ações, de renda fixa ou outro). Você compra uma cesta de uma vez, em vez de escolher papel por papel. Tem taxa e o risco do índice que ele copia. Não escolhe 'a melhor ação' por você.",
  },
  {
    keys: ["acao", "ação", "acoes", "ações"],
    text: "Ação é uma fração de uma empresa, negociada em bolsa. O preço muda todo dia. Há risco de perder parte relevante do valor, e também de a empresa não pagar dividendo. Diversificar e ter prazo longo reduz o efeito de um único papel, mas não tira o risco.",
  },
  {
    keys: ["fgc"],
    text: "O FGC é um fundo que garante alguns investimentos de banco (como CDB, LCI e LCA) até um teto por CPF e por instituição, se o banco quebrar. Tesouro Direto, ação, FII e ETF não entram nessa garantia. O teto muda por norma; vale conferir o valor vigente.",
  },
  {
    keys: ["juros compostos", "juros composto"],
    text: "Juros compostos são juros sobre os juros: o rendimento fica no saldo e passa a render também. No longo prazo o prazo pesa mais do que acertar o mês de entrada. A calculadora do Ordre faz essa conta com a taxa que você informar.",
  },
  {
    keys: ["regra dos 4", "regra dos quatro"],
    text: "A regra dos 4% é uma referência de estudos de aposentadoria: retirar cerca de 4% ao ano de uma carteira diversificada, ajustando pela inflação, para o dinheiro durar décadas. É um ponto de partida, não uma garantia, e depende da carteira e do prazo.",
  },
  {
    keys: ["risco", "liquidez"],
    text: "Risco é a chance de o valor oscilar ou de você não receber o combinado. Liquidez é a facilidade de transformar em dinheiro no dia em que precisar. Os dois andam juntos: o que rende mais em geral trava o resgate ou oscila mais. A reserva de emergência pede liquidez; o longo prazo aguenta oscilação.",
  },
];

const ASSET_ASK =
  /\b(compr[oa]r?|vend[ae]r?|segur[ae]|vale a pena|devo|hora de|caiu|subiu|entro|saio|recomenda)\b/i;

export type Holding = {
  asset_class: InvestmentClass | string;
  current_amount: number;
};

export type PortfolioFacts = {
  profile: InvestorProfile | null;
  currency: string;
  holdings: Holding[];
};

export function isSpecificAssetQuestion(question: string): boolean {
  const f = fold(question);
  const ticker = /\b[a-z]{4}\d{1,2}\b/i.test(question);
  if (ticker) return true;
  if (ASSET_ASK.test(f) && /\b(acao|ação|ativo|fii|tesouro|cdb|lci|etf|fundo|cripto)\b/.test(f)) {
    return true;
  }
  return false;
}

export function conceptAnswer(question: string): string | null {
  const f = fold(question);
  for (const c of CONCEPTS) {
    if (c.keys.some((k) => f.includes(fold(k)))) return c.text;
  }
  return null;
}

export function profileBlurb(profile: InvestorProfile): string {
  const info = PROFILE_INFO[profile];
  return `No Ordre, o perfil ${info.label} tem alvo de cerca de ${info.allocation.rendaFixa}% em renda fixa e ${info.allocation.variavel}% em renda variável. ${info.blurb} Renda fixa (por exemplo Tesouro e CDB) oscila menos. Renda variável (ações, FIIs, ETFs, cripto) oscila mais. Essa explicação é a mesma para toda pessoa com esse perfil. O quiz do app é educativo e não é suitability de corretora.`;
}

export function portfolioCompare(facts: PortfolioFacts, formatMoney: (n: number) => string): string {
  if (!facts.profile) {
    return "Você ainda não escolheu um perfil de investidor no Ordre. O quiz é educativo (não é a suitability que a CVM exige de uma corretora). Quando ele estiver preenchido, eu comparo a fatia de renda variável da sua carteira com o alvo desse perfil.";
  }
  const info = PROFILE_INFO[facts.profile];
  if (!facts.holdings.length) {
    return `${profileBlurb(facts.profile)} Ainda não há ativos lançados na carteira do painel, então não tenho números seus para comparar.`;
  }
  const total = facts.holdings.reduce((s, h) => s + Number(h.current_amount), 0);
  const variable = facts.holdings
    .filter((h) => VARIABLE_CLASSES.has(String(h.asset_class)))
    .reduce((s, h) => s + Number(h.current_amount), 0);
  const pct = total > 0 ? Math.round((variable / total) * 100) : 0;
  const target = info.allocation.variavel;
  const diff = pct - target;
  const classes = facts.holdings.reduce<Record<string, number>>((acc, h) => {
    const key = String(h.asset_class);
    acc[key] = (acc[key] ?? 0) + Number(h.current_amount);
    return acc;
  }, {});
  const lines = Object.entries(classes)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${CLASS_LABELS[k] ?? k}: ${formatMoney(v)}`)
    .join("; ");
  const gap =
    Math.abs(diff) <= 10
      ? "A fatia de renda variável está perto do alvo desse perfil."
      : diff > 0
        ? `A renda variável está cerca de ${diff} pontos acima do alvo (${target}%).`
        : `A renda variável está cerca de ${Math.abs(diff)} pontos abaixo do alvo (${target}%).`;
  return `Carteira lançada no Ordre: ${formatMoney(total)}. Renda variável em ${pct}% (alvo do perfil ${info.label}: ${target}%). ${gap} Por classe: ${lines}. Eu mostro a diferença. Não indico um ativo para aportar nem para resgatar.`;
}

const BANNED = [
  /\bcompre\b/i,
  /\bcomprar agora\b/i,
  /\bvenda agora\b/i,
  /\bvender agora\b/i,
  /\bsegure\b/i,
  /\b(recomendo|sugiro|indico)\s+(comprar|vender|a compra|a venda|entrar|sair)\b/i,
  /\bvale(?: a pena)? (comprar|vender)\b/i,
  /\bhora de (comprar|vender|entrar|sair)\b/i,
  /\bbom momento para\b/i,
  /\bcarteira recomendada\b/i,
  /\boportunidade de compra\b/i,
];

const SAFE_FALLBACK =
  "Posso explicar o conceito e mostrar como a sua carteira está em relação ao perfil que você escolheu. Não indico ativo, nem momento de entrar ou sair.";

/** Troca a resposta inteira se o texto induzir compra ou venda de ativo. */
export function guardEducational(text: string): string {
  if (BANNED.some((r) => r.test(text))) return SAFE_FALLBACK;
  return text;
}

export function withDisclaimer(text: string): string {
  const body = guardEducational(text).trim();
  if (body.includes("Aviso educativo:")) return body.slice(0, 1500);
  return `${body}\n\n${EDUCATIONAL_DISCLAIMER}`.slice(0, 1800);
}

export function educationalReply(
  question: string,
  facts: PortfolioFacts,
  formatMoney: (n: number) => string,
): { text: string; needsModel: boolean } {
  if (isSpecificAssetQuestion(question)) {
    const compare = facts.profile ? `\n\n${portfolioCompare(facts, formatMoney)}` : "";
    return {
      needsModel: false,
      text: withDisclaimer(
        `Não olho um ativo específico para dizer se cabe comprar, vender ou esperar. Dá para observar, com calma, o fato que moveu o preço (com fonte), o peso disso na sua carteira, o prazo em que você precisa do dinheiro e se a reserva está pronta.${compare}`,
      ),
    };
  }
  const f = fold(question);
  if (/\b(carteira|perfil|alocac|alocaç)\b/.test(f)) {
    return { needsModel: false, text: withDisclaimer(portfolioCompare(facts, formatMoney)) };
  }
  const concept = conceptAnswer(question);
  if (concept) {
    const extra = facts.profile ? `\n\n${profileBlurb(facts.profile)}` : "";
    return { needsModel: false, text: withDisclaimer(`${concept}${extra}`) };
  }
  return { needsModel: true, text: "" };
}
