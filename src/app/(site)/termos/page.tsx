import { pageMetadata } from "@/lib/seo";
import { LegalPage, COMPANY } from "@/components/LegalPage";

export const metadata = pageMetadata({ title: "Termos de Uso", path: "/termos" });

const content = `
## 1. Quem somos

A Ordre é um serviço de software operado por ${COMPANY.legalName} (${COMPANY.doc}), com sede em ${COMPANY.city}, responsável ${COMPANY.owner}. Contato: ${COMPANY.supportEmail}.

## 2. O que a Ordre faz

A Ordre é uma ferramenta de organização financeira pessoal. Ela ajuda você a registrar e visualizar orçamento, reserva de emergência, metas, investimentos e patrimônio. **A Ordre não executa transações, não movimenta dinheiro e não é instituição financeira.**

## 3. Conteúdo informativo, não consultoria

Os textos, calculadoras, aulas e sugestões da IA têm caráter educativo e informativo. Não constituem recomendação personalizada de investimento, consultoria financeira, contábil ou jurídica registrada. As decisões sobre seu dinheiro são exclusivamente suas.

## 4. Sua conta

- Você precisa fornecer dados verdadeiros no cadastro.
- Você é responsável por manter a senha em segurança e por toda atividade na sua conta.
- Avise imediatamente em ${COMPANY.securityEmail} se suspeitar de acesso não autorizado.
- É proibido usar a Ordre para atividade ilícita, tentar burlar limites de plano, ou acessar dados de outros usuários.

## 5. Planos e pagamento

Os planos, preços e o que cada um inclui estão na página de Preços. A cobrança é processada por parceiro de pagamento (Kiwify). O acesso ao plano é ativado após a confirmação do pagamento e permanece ativo até o fim do período pago.

## 6. Cancelamento

Você pode cancelar a qualquer momento. O cancelamento passa a valer no próximo ciclo; não há reembolso proporcional de período já iniciado, salvo quando exigido por lei.

## 7. Disponibilidade

Fazemos esforço razoável para manter o serviço disponível, mas ele é fornecido "como está". Podemos realizar manutenções e alterações. Não garantimos ausência total de falhas.

## 8. Limitação de responsabilidade

Na máxima extensão permitida pela lei, a Ordre não responde por perdas financeiras decorrentes de decisões que você tomou com base em informações do serviço, nem por lucros cessantes.

## 9. Encerramento

Podemos suspender ou encerrar contas que violem estes Termos. Você pode encerrar sua conta a qualquer momento; nesse caso, seus dados são tratados conforme a Política de Privacidade.

## 10. Alterações

Podemos atualizar estes Termos. Mudanças relevantes serão comunicadas por e-mail ou dentro do produto com antecedência razoável.

## 11. Lei aplicável

Aplica-se a lei brasileira. Fica eleito o foro da comarca de Indaiatuba – SP, salvo direito do consumidor de escolher o foro do seu domicílio.
`;

export default function TermosPage() {
  return <LegalPage title="Termos de Uso" updatedAt="6 de setembro de 2026" content={content} />;
}
