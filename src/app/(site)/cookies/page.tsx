import { pageMetadata } from "@/lib/seo";
import { LegalPage, COMPANY } from "@/components/LegalPage";

export const metadata = pageMetadata({ title: "Política de Cookies", path: "/cookies" });

const content = `
## O que são cookies

Pequenos arquivos que o site guarda no seu navegador para lembrar preferências e medir uso.

## Categorias que usamos

| Categoria | Para quê | Você controla? |
|---|---|---|
| Necessários | Manter você logado (sessão), lembrar o consentimento, segurança | Não — são essenciais |
| Análise | Entender como o produto é usado e onde melhorar (Google Analytics, com IP anonimizado) | Sim |
| Marketing | Medir a origem de novos usuários | Sim |

## Como controlar

Na primeira visita aparece um banner com as opções **Aceitar todos**, **Só os necessários** e **Personalizar**. Você pode mudar a escolha limpando os dados do site no navegador e recarregando a página, ou escrevendo para ${COMPANY.privacyEmail}.

## Cookies necessários não podem ser desativados

Sem eles o login e as proteções de segurança não funcionam. Eles não rastreiam você para fins de publicidade.

## Terceiros

Quando você consente com análise, o Google Analytics pode definir cookies próprios. Consulte a política de privacidade do Google para detalhes.
`;

export default function CookiesPage() {
  return <LegalPage title="Política de Cookies" updatedAt="6 de setembro de 2026" content={content} />;
}
