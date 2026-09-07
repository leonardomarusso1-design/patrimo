import { pageMetadata } from "@/lib/seo";
import { LegalPage, COMPANY } from "@/components/LegalPage";

export const metadata = pageMetadata({
  title: "Segurança",
  description: "Como a Patrimo protege seus dados e como reportar uma vulnerabilidade.",
  path: "/seguranca",
});

const content = `
## Como protegemos seus dados

- **Sessão em cookie httpOnly + Secure + SameSite.** O token de autenticação não fica acessível a scripts da página, o que neutraliza roubo de sessão via XSS.
- **Row Level Security (RLS) no banco.** Toda tabela tem política que garante que um usuário só lê e altera as próprias linhas — a autorização é no banco, não só no frontend.
- **Criptografia em trânsito (TLS) e em repouso**, provida pela infraestrutura (Supabase / AWS).
- **Rate limiting** nos endpoints sensíveis (autenticação, webhooks, tracking) para conter força bruta e abuso.
- **Erros genéricos para o cliente.** O erro real é registrado no servidor; nunca expomos stack trace ou mensagem do banco.
- **Cabeçalhos de segurança:** Content-Security-Policy, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy e Permissions-Policy.
- **Monitoramento de erros** em cliente, servidor e edge.
- **Dependências** acompanhadas com verificação automática de vulnerabilidades.

## Reportar uma vulnerabilidade

Se você encontrou um problema de segurança, escreva para **${COMPANY.securityEmail}** com:

- Descrição do problema e do impacto potencial
- Passos para reproduzir
- Sua chave PGP, se quiser resposta cifrada

Pedimos que você não divulgue publicamente antes de darmos retorno e corrigirmos. Não movemos ação legal contra pesquisas de boa-fé que sigam esta política.

O arquivo padrão está em \`/.well-known/security.txt\` (RFC 9116).

## O que esperamos de você

- Use uma senha forte e única.
- Ative verificação em duas etapas quando disponível.
- Desconfie de e-mails pedindo sua senha — a Patrimo nunca pede.
`;

export default function SegurancaPage() {
  return <LegalPage title="Segurança" updatedAt="6 de setembro de 2026" content={content} />;
}
