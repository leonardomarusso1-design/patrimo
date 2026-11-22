import { siteUrl } from "./config";
import type { EntryDraft } from "./classify";
import { kindLabel, whenLabel } from "./text";
import { formatCurrency } from "@/lib/utils";

export function blockedText(): string {
  return `Seu acesso ao Ordre acabou. O teste dura 7 dias e não existe plano grátis. Para voltar, inclusive no WhatsApp, ative em ${siteUrl()}/ativar`;
}

export function quotaText(limit: number): string {
  return `Você usou as ${limit} ações do WhatsApp neste mês (lançamento, foto, consulta e dúvida). Dá para comprar um pacote avulso no painel: ${siteUrl()}/app/whatsapp`;
}

export function helpText(): string {
  return [
    "Pode mandar assim:",
    "• lanche 9,90",
    "• paguei a luz 187,40",
    "• recebi 3200 de salário",
    "• vence dia 10 o aluguel 1800 todo mês",
    "• foto do comprovante",
    "• quanto gastei este mês?",
    "• tenho conta pra pagar essa semana?",
    "• paguei o aluguel",
    "Correção: \"na verdade foi 12\", \"categoria Transporte\", \"isso é fixo\" ou \"desfazer\".",
    "Dúvida de investimento é só educativa: eu explico o conceito e comparo a sua carteira com o seu perfil. Não indico compra nem venda de ativo.",
    "Avisos: \"parar\". Eu não peço senha, CPF, cartão nem código.",
  ].join("\n");
}

export function welcomeText(firstName: string): string {
  const who = firstName ? `${firstName}, número` : "Número";
  return [
    `${who} conectado à sua conta Ordre.`,
    "",
    "Manda um gasto (\"lanche 9,90\"), uma receita (\"recebi 3200 de salário\") ou a foto de um comprovante. O lançamento aparece no painel.",
    "",
    "Eu não peço senha, CPF, cartão nem código. Se alguém pedir isso em nome do Ordre, não envie.",
    "",
    "Dúvida de investimento aqui é educativa: conceito e comparação com o seu perfil. Sem recomendação de compra ou venda (Resoluções CVM 19 e 20).",
    "",
    "\"ajuda\" mostra os exemplos. \"parar\" desliga os avisos. Para desconectar, use o painel.",
  ].join("\n");
}

export function describeDraft(draft: EntryDraft, today: string, currency = "BRL"): string {
  const bits = [
    draft.name,
    formatCurrency(draft.amount, currency),
    draft.category ?? "sem categoria",
    kindLabel(draft.kind),
    whenLabel(draft.entryDate, today),
  ];
  if (draft.recurring) bits.push("todo mês");
  if (draft.installmentsTotal) bits.push(`${draft.installmentsTotal}x`);
  return bits.join(", ");
}

export function savedText(draft: EntryDraft, today: string, currency = "BRL"): string {
  return `Anotado: ${describeDraft(draft, today, currency)}. Para desfazer, toque em Desfazer ou mande "desfazer".`;
}

export function confirmText(draft: EntryDraft, today: string, currency = "BRL"): string {
  const extra = draft.categoryUnlisted
    ? ` A categoria "${draft.category}" não está na sua lista. Se confirmar, uso só neste lançamento.`
    : "";
  return `Anoto ${describeDraft(draft, today, currency)}?${extra}`;
}

export function askCategoryText(draft: EntryDraft, today: string, names: string[], currency = "BRL"): string {
  const list = names.slice(0, 8).join(", ");
  const suggestion = draft.category ? ` Posso usar "${draft.category}" se você confirmar.` : "";
  return `Entendi ${draft.name}, ${formatCurrency(draft.amount, currency)}, ${kindLabel(draft.kind)}, ${whenLabel(draft.entryDate, today)}. Qual categoria?${suggestion}${list ? ` As suas: ${list}.` : ""}`;
}

export const FIX_HINT =
  "Manda a correção do último lançamento: \"na verdade foi 12\", \"categoria Transporte\" ou \"isso é fixo\".";

export const UNLINKED_HINT =
  `Para usar o Ordre aqui, gere um código no painel (${siteUrl()}/app/whatsapp) e envie nesta conversa. O código começa com ORDRE-.`;

export const BAD_CODE = "Código inválido ou vencido. Gere outro no painel e envie de novo.";

export const PHOTO_UNSUPPORTED =
  "Ainda não consigo ler a foto (a leitura usa a mesma IA do painel e ela não está disponível). Manda em texto, por exemplo: mercado 86,40";

export const PHOTO_UNREADABLE =
  "Não consegui ler o total dessa foto. Manda em texto, por exemplo: mercado 86,40. A imagem não fica guardada.";

export const NOT_A_PHOTO =
  "Por enquanto eu entendo texto e foto de comprovante. Áudio ainda não.";
