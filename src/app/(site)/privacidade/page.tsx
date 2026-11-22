import { pageMetadata } from "@/lib/seo";
import { LegalPage, COMPANY } from "@/components/LegalPage";

export const metadata = pageMetadata({ title: "Política de Privacidade", path: "/privacidade" });

const content = `
## 1. Controlador

${COMPANY.legalName} (${COMPANY.doc}), ${COMPANY.city}, é a controladora dos dados tratados na Ordre, nos termos da Lei nº 13.709/2018 (LGPD). Encarregado / contato: ${COMPANY.privacyEmail}.

## 2. Dados que coletamos

- **Cadastro:** nome, e-mail e, se você usar login social, o identificador da conta Google.
- **Perfil:** moeda de exibição, faixa de renda, profissão e localidade que você informa no onboarding.
- **Dados financeiros que você insere:** lançamentos de orçamento, reserva, metas, investimentos, patrimônio e dívidas.
- **Uso:** eventos de navegação e desempenho, sempre que você consentir com cookies de análise.
- **Técnicos:** um hash irreversível do seu IP em registros de segurança (o IP em si não é armazenado em claro).
- **WhatsApp, se você conectar:** o número fica cifrado e também em hash, para achar a sua conta sem guardar o número em claro nos registros. A mensagem em si não fica armazenada. Foto de comprovante é lida na hora e apagada em seguida. Você pode desconectar e apagar o histórico do bot no painel.

## 3. Para que usamos

| Finalidade | Base legal |
|---|---|
| Criar e manter sua conta | Execução de contrato |
| Exibir e calcular seus dados financeiros | Execução de contrato |
| Sugestões da IA de investimentos (plano Elite) | Execução de contrato |
| Segurança, prevenção a fraude e abuso | Legítimo interesse |
| Métricas de produto | Consentimento (cookies) |
| Registrar o que você manda no WhatsApp do Ordre | Execução de contrato |
| Avisos proativos no WhatsApp (resumo e conta a pagar) | Consentimento (opt-in, desligado por padrão) |
| Comunicações de marketing | Consentimento (opt-in) |

## 4. Compartilhamento

Compartilhamos dados apenas com operadores necessários ao funcionamento do serviço: infraestrutura e banco (Supabase), hospedagem (Vercel), pagamento (Kiwify), e-mail transacional (Resend), WhatsApp (Meta), quando você usa o bot, leitura de comprovante e texto ambíguo (OpenAI) e análise (Google Analytics, se consentido). Não vendemos dados pessoais.

## 5. Transferência internacional

Alguns operadores processam dados fora do Brasil. Exigimos que adotem salvaguardas compatíveis com a LGPD.

## 6. Retenção

Mantemos seus dados enquanto sua conta existir. O registro técnico das mensagens do WhatsApp (sem o texto) é apagado em até 30 dias. Após a exclusão da conta, apagamos ou anonimizamos os dados em até 30 dias, salvo obrigação legal de guarda (ex.: registros fiscais e de pagamento).

## 7. Seus direitos

Você pode, a qualquer momento: confirmar o tratamento, acessar, corrigir, portar, anonimizar ou excluir seus dados, e revogar consentimentos. Basta escrever para ${COMPANY.privacyEmail}. Respondemos em até 15 dias.

## 8. Segurança

Sessão em cookie httpOnly, criptografia em trânsito e em repouso, Row Level Security no banco, rate limiting e monitoramento de erros. Nenhum sistema é 100% imune — em caso de incidente relevante, comunicaremos você e a ANPD conforme a lei.

## 9. Cookies

Detalhes na Política de Cookies. Você controla os cookies de análise e marketing pelo banner de consentimento.

## 10. Crianças

A Ordre não é destinada a menores de 18 anos e não coletamos dados dessa faixa de forma consciente.
`;

export default function PrivacidadePage() {
  return (
    <LegalPage title="Política de Privacidade" updatedAt="22 de novembro de 2026" content={content} />
  );
}
