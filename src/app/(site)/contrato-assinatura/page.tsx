import { pageMetadata } from "@/lib/seo";
import { LegalPage, COMPANY } from "@/components/LegalPage";

export const metadata = pageMetadata({
  title: "Contrato de Assinatura",
  path: "/contrato-assinatura",
});

const content = `
## Partes

Este contrato é firmado entre **${COMPANY.legalName}** (${COMPANY.doc}), ${COMPANY.city} ("Ordre"), e você, pessoa física que contrata um plano ("Assinante").

## 1. Objeto

Licença de uso, não exclusiva e intransferível, da plataforma Ordre, na modalidade software como serviço (SaaS), conforme o plano contratado (Essencial, Pro ou Elite).

## 2. Vigência e renovação

O contrato vigora a partir da confirmação do pagamento e se renova automaticamente ao fim de cada ciclo (mensal ou anual), pelo mesmo prazo, até que o Assinante cancele.

## 3. Preço e reajuste

O preço é o vigente na contratação, exibido na página de Preços. Reajustes serão comunicados com pelo menos 30 dias de antecedência e só valem para o ciclo seguinte.

## 4. Pagamento

Processado pela Kiwify (Pix, boleto ou cartão). O não pagamento suspende o acesso ao plano após o vencimento, sem prejuízo da guarda dos dados por 30 dias.

## 5. Cancelamento e reembolso

O cancelamento pode ser feito a qualquer momento e passa a valer no ciclo seguinte. Contratações feitas fora do estabelecimento comercial seguem o direito de arrependimento de 7 dias do Código de Defesa do Consumidor.

## 6. Nível de serviço

A Ordre empregará esforços comercialmente razoáveis para manter o serviço disponível. Manutenções programadas serão avisadas quando possível.

## 7. Dados do Assinante

Os dados são tratados conforme a Política de Privacidade. O Assinante pode exportar ou solicitar exclusão a qualquer tempo.

## 8. Rescisão

Qualquer parte pode rescindir por descumprimento não sanado em 10 dias após notificação. A Ordre pode rescindir imediatamente em caso de uso fraudulento ou ilícito.

## 9. Disposições gerais

O contrato é regido pela lei brasileira. Eventual tolerância não implica novação. Foro: comarca de Indaiatuba – SP, resguardado o foro do domicílio do consumidor.
`;

export default function ContratoPage() {
  return (
    <LegalPage title="Contrato de Assinatura" updatedAt="6 de setembro de 2026" content={content} />
  );
}
