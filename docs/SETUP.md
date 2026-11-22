# Ordre — guia de setup passo a passo

Este documento leva o Ordre do estado atual (código pronto, Supabase provisionado)
até "no ar em produção". Cada passo tem o que clicar, o que copiar e onde colar.

Estado atual:

- Código completo em `C:\patrimo`, repositório git com histórico.
- Supabase criado: projeto `patrimo`, ref `rhztczldzsopjkbaitqg`, região `sa-east-1`.
  Migrations `0001_init` e `0002_harden_functions` já aplicadas (15 tabelas com RLS).
- `.env.local` já preenchido com a URL e a anon key do Supabase.
- Login por e-mail já funciona. Falta o login com Google e o deploy.

---

## Passo 1 — Subir o código para o GitHub

O repositório remoto já está configurado (`origin` =
`https://github.com/leonardomarusso1-design/patrimo.git`).

1. Abra o terminal na pasta do projeto:
   ```
   cd C:\patrimo
   ```
2. Envie:
   ```
   git push -u origin main
   ```
3. **Se der erro 403 (`Permission ... denied`)**: o git está autenticado com a conta
   errada. Corrija assim:
   ```
   gh auth switch --hostname github.com --user leonardomarusso1-design
   gh auth setup-git
   cmdkey /delete:git:https://github.com
   git push -u origin main
   ```
   Na primeira vez o navegador pode abrir pedindo para autorizar — autorize com a
   conta **leonardomarusso1-design**.
4. Confirme em `https://github.com/leonardomarusso1-design/patrimo` que os arquivos
   apareceram.

---

## Passo 2 — Login com Google (Google Cloud + Supabase)

Sem isso, o botão "Continuar com Google" dá erro. O login por e-mail continua
funcionando independente deste passo.

### 2.1 Criar as credenciais no Google Cloud

1. Acesse `https://console.cloud.google.com/`.
2. No topo, crie um projeto novo (menu de projetos → "Novo projeto"). Nome: `Ordre`.
   Aguarde criar e selecione esse projeto.
3. Menu lateral → **APIs e serviços → Tela de permissão OAuth** (OAuth consent screen).
   - Tipo de usuário: **Externo**. Criar.
   - Nome do app: `Ordre`. E-mail de suporte: o seu. Domínio do desenvolvedor: o seu e-mail.
   - Em "Escopos", não precisa adicionar nada (o padrão `email`, `profile`, `openid` basta).
   - Salvar e continuar até o fim. Pode deixar em modo "Teste" por enquanto (funciona
     com sua conta; publique depois para abrir para todos).
4. Menu lateral → **APIs e serviços → Credenciais** → **Criar credenciais → ID do
   cliente OAuth**.
   - Tipo de aplicativo: **Aplicativo da Web**.
   - Nome: `Ordre Web`.
   - **URIs de redirecionamento autorizados** — adicione exatamente esta:
     ```
     https://rhztczldzsopjkbaitqg.supabase.co/auth/v1/callback
     ```
   - Criar. Uma janela mostra o **ID do cliente** e a **Chave secreta do cliente**.
     Copie os dois (guarde num lugar seguro por enquanto).

### 2.2 Ligar no Supabase

1. Acesse `https://supabase.com/dashboard/project/rhztczldzsopjkbaitqg`.
2. Menu lateral → **Authentication → Sign In / Providers** (ou "Providers").
3. Encontre **Google**, ative o toggle.
4. Cole:
   - **Client ID (for OAuth)**: o ID do cliente do passo 2.1.
   - **Client Secret (for OAuth)**: a chave secreta do passo 2.1.
5. Salvar.

### 2.3 Configurar as URLs de redirecionamento do Supabase

1. Ainda em **Authentication → URL Configuration**.
2. **Site URL**: por enquanto `http://localhost:3000`. Depois do deploy, troque para
   `https://SEU-DOMINIO` (ou a URL da Vercel).
3. **Redirect URLs** — adicione (uma por linha):
   ```
   http://localhost:3000/**
   https://SEU-DOMINIO/**
   ```
   (o `/**` no fim permite qualquer caminho abaixo, incluindo `/auth/callback`.)
4. Salvar.

### 2.4 (Opcional) Personalizar e-mails

**Authentication → Emails** → edite o template "Confirm signup" para o texto/assunto
que quiser. O padrão já funciona.

### 2.5 (Recomendado) Ativar MFA

**Authentication → Settings** (ou "Multi-Factor Authentication") → ative **TOTP**.
A tela de ativação para o usuário final ainda não existe no app (está na lista de
pendências), mas deixar habilitado no projeto não atrapalha.

---

## Passo 3 — Rodar local para testar

1. Terminal:
   ```
   cd C:\patrimo
   npm install
   npm run dev
   ```
2. Abra `http://localhost:3000`.
3. Teste: criar conta → confirmar pelo link do e-mail → onboarding → lançar algo no
   Orçamento. Se tudo funcionar, pode partir para o deploy.

---

## Passo 4 — Deploy na Vercel

### 4.1 Importar o projeto

1. Acesse `https://vercel.com/`, faça login com o GitHub (conta
   **leonardomarusso1-design**).
2. **Add New → Project** → selecione o repositório `patrimo` → **Import**.
3. A Vercel detecta Next.js sozinha. Não mexa em build command nem output.

### 4.2 Variáveis de ambiente

Antes de clicar em **Deploy**, abra **Environment Variables** e adicione (para
Production, Preview e Development):

| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://ordre.toqy.com.br` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rhztczldzsopjkbaitqg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (mesma do `.env.local`) |

Opcionais (deixe em branco se ainda não tiver):

| Nome | Valor |
|---|---|
| `UPSTASH_REDIS_REST_URL` | do Passo 7 |
| `UPSTASH_REDIS_REST_TOKEN` | do Passo 7 |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` se for usar Google Analytics |
| `KIWIFY_WEBHOOK_SECRET` | do Passo 8 |

A anon key está em `C:\patrimo\.env.local` — copie a linha `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 4.3 Deploy

Clique **Deploy**. Em ~2 minutos você recebe uma URL tipo
`https://patrimo-xxxx.vercel.app`.

### 4.4 Depois do deploy (domínio atual: `ordre.toqy.com.br`)

1. Volte ao Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `https://ordre.toqy.com.br`.
   - **Redirect URLs**: adicione `https://ordre.toqy.com.br/**` (e, enquanto houver link antigo em uso, `https://patrimo-ashy.vercel.app/**`).
2. Habilite **Leaked Password Protection** em Authentication → Providers → Email
   (checa senhas vazadas no HaveIBeenPwned). Advisor do Supabase pediu isso.
2. Na Vercel → **Settings → Environment Variables**: ajuste `NEXT_PUBLIC_SITE_URL`
   para a mesma URL e faça **Redeploy** (aba Deployments → menu do último deploy →
   Redeploy).
3. Se for usar Google login em produção, adicione também no Google Cloud
   (Credenciais → seu OAuth client → URIs de redirecionamento) — nada muda aqui, o
   redirect continua sendo o do Supabase (`.../auth/v1/callback`). Só publique a
   "Tela de permissão OAuth" (botão "Publicar app") quando quiser abrir para o
   público geral.

### 4.5 Domínio

O app roda em `ordre.toqy.com.br` (subdomínio do Toqy). Na Vercel → **Settings → Domains** o domínio já está no projeto. No Cloudflare
(DNS do `toqy.com.br`) existe um CNAME `ordre` apontando para `cname.vercel-dns.com`, só DNS (nuvem cinza). Se um dia o Ordre ganhar domínio próprio,
adicione-o na Vercel e refaça o Passo 4.4.

---

## Passo 5 — Cloudflare (WAF + DDoS)

O DNS do `toqy.com.br` já está no Cloudflare. Este passo só vale se o Ordre ganhar domínio próprio.

1. Crie conta em `https://cloudflare.com`, **Add a site** → o domínio novo.
2. Cloudflare mostra os nameservers dele. Vá no seu registrador de domínio e troque
   os nameservers para os da Cloudflare.
3. Nos registros DNS da Cloudflare, aponte para a Vercel (a Vercel te dá o alvo
   CNAME/A). Deixe a nuvem **laranja** (proxied) — é isso que ativa WAF, DDoS e
   esconde o IP de origem.
4. Em **SSL/TLS**, modo **Full (strict)**.
5. Em **Security → WAF**, deixe as regras gerenciadas ligadas (padrão).

---

## Passo 6 — Segurança do repositório GitHub

1. `https://github.com/leonardomarusso1-design/patrimo/settings/security_analysis`
2. Ative:
   - **Dependabot alerts**
   - **Dependabot security updates**
   - **Secret scanning** (e "Push protection")

---

## Passo 7 — Upstash Redis (rate limiting)

Sem isso o app roda, mas sem limite de tentativas nos endpoints de login/consent.

1. `https://upstash.com` → login → **Create Database**.
   - Tipo: Redis. Nome: `ordre`. Região: `sa-east-1` (São Paulo) ou a mais próxima.
   - Primary Region só, não precisa réplica.
2. Na página do banco criado, aba **REST API**, copie:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Cole os dois na Vercel (Passo 4.2) e faça Redeploy.

---

## Passo 8 — Kiwify (plano único)

O produto é **um plano só**: R$ 97,90 pelo ano, parcelável em até 12x no cartão.
O link de checkout já está no código (`src/lib/plans.ts` → `https://kiwify.app/LuK5uon`).
O webhook (`/api/kiwify/webhook`) **já foi construído**.

O que falta na Kiwify:

1. Confirme que o produto/oferta em `https://kiwify.app/LuK5uon` está:
   - Preço **R$ 97,90**, cobrança **anual** (ou pagamento único de 1 ano).
   - **Parcelamento em até 12x** habilitado no cartão.
2. **Apps → Webhooks → Criar webhook**:
   - URL: `https://ordre.toqy.com.br/api/kiwify/webhook`
   - Eventos: **compra aprovada**, **compra recusada/reembolsada**, **chargeback**,
     **assinatura renovada**, **assinatura cancelada**.
   - Copie o **token/segredo** do webhook.
3. Na Vercel, a env var **`KIWIFY_WEBHOOK_SECRET`** = esse token. (Já aparece na sua
   lista de env vars — confirme que o valor está preenchido.)
4. **Falta uma env var na Vercel: `SUPABASE_SERVICE_ROLE_KEY`** — o webhook precisa
   dela para liberar o plano de outros usuários (ignora RLS). Pegue em
   Supabase → Project Settings → API → `service_role` secret e adicione na Vercel
   (Production + Preview). Sem isso o webhook retorna erro 500.

Como o acesso funciona (hard paywall):
- Pessoa se cadastra → faz onboarding → cai em **`/ativar`** com o botão da Kiwify.
- Paga na Kiwify → webhook libera o plano por 1 ano → `/app` abre.
- Se a pessoa comprar **antes** de ter conta, a compra fica guardada em
  `pending_purchases` e é aplicada automaticamente quando ela criar a conta com o
  mesmo e-mail.
- Reembolso / cancelamento / chargeback → webhook remove o acesso.

---

## Passo 9 — Nome e marca

Antes de gastar com identidade visual / anúncios:

1. O app usa `ordre.toqy.com.br`. Se quiser um domínio próprio, confirme o registro no `registro.br`.
2. Faça a busca de marca no INPI (`https://busca.inpi.gov.br`) na classe de software /
   serviços financeiros. A busca formal do INPI para "Ordre" ainda não foi feita.

---

## Passo 10 — WhatsApp (quando o chip existir)

O bot já está no código e **fica desligado**. Nada é enviado e o webhook não grava
lançamento enquanto `WHATSAPP_BOT_ENABLED` não for exatamente `true`. Sem a migration
`0026_whatsapp.sql` aplicada, a tela em `/app/whatsapp` mostra "em preparação" e o
painel continua no ar.

Ordem, sem pular:

1. **Meta Business.** Crie ou use uma conta WhatsApp Business na Meta, com a empresa
   verificada. O número do chip precisa ser **novo para o WhatsApp** (não pode estar
   no app do celular). Anote o Phone number ID e o WhatsApp Business Account ID.
2. **App e token.** No app da Meta, adicione o produto WhatsApp. Gere um token
   permanente (usuário do sistema, permissão `whatsapp_business_messaging`). O App
   Secret fica em Configurações do app. Crie um Verify token seu (uma senha longa).
3. **Banco.** No SQL editor do Supabase, rode o arquivo
   `supabase/migrations/0026_whatsapp.sql`. Não rode nada além desse arquivo por causa
   do bot. A migration **não foi aplicada** por este trabalho.
4. **Variáveis na Vercel** (Production), ainda com a flag desligada:

   | Nome | Para que serve |
   |---|---|
   | `WHATSAPP_BOT_ENABLED` | `true` só no fim. Qualquer outro valor desliga. |
   | `WHATSAPP_PHONE_NUMBER_ID` | ID do número na Cloud API |
   | `WHATSAPP_BUSINESS_ACCOUNT_ID` | ID da conta WhatsApp Business (referência) |
   | `WHATSAPP_ACCESS_TOKEN` | token permanente |
   | `WHATSAPP_APP_SECRET` | valida `X-Hub-Signature-256` |
   | `WHATSAPP_VERIFY_TOKEN` | o desafio do webhook (GET) |
   | `WHATSAPP_DISPLAY_NUMBER` | número público com DDI, só dígitos, para o link wa.me |
   | `WHATSAPP_PHONE_PEPPER` | segredo para hash e cifra do telefone. `openssl rand -base64 32`. Não troque depois: os vínculos quebram. |
   | `WHATSAPP_GRAPH_VERSION` | opcional, padrão `v22.0` |
   | `WHATSAPP_MONTHLY_QUOTA` | ações por mês incluídas no plano. Padrão `80`. |
   | `WHATSAPP_PACK_MESSAGES` | tamanho do pacote avulso. Padrão `100`. |
   | `WHATSAPP_PACK_CHECKOUT_URL` | link https da Kiwify do pacote, quando o produto existir |
   | `KIWIFY_WHATSAPP_PACK_PRODUCT_ID` | id do produto na Kiwify. Sem isso, compra não vira crédito e o plano anual segue igual. |
   | `WHATSAPP_TEMPLATE_DAILY` | nome do modelo de contas do dia |
   | `WHATSAPP_TEMPLATE_WEEKLY` | nome do modelo do resumo semanal |
   | `WHATSAPP_TEMPLATE_MONTHLY` | nome do modelo do fechamento |
   | `WHATSAPP_TEMPLATE_LANG` | opcional, padrão `pt_BR` |
   | `OPENAI_API_KEY` | a mesma chave do Assistente. Sem ela, texto com regra pronta funciona; foto pede o valor em texto. |
   | `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | limite por IP. Há também um limite no banco, por número. |
   | `CRON_SECRET` | o cron das 8h (Brasília) já usa o mesmo segredo dos outros crons. |

5. **Webhook.** URL `https://ordre.toqy.com.br/api/whatsapp/webhook`. A Meta manda um
   GET com o verify token: isso responde mesmo com a flag desligada. Campos assinados
   em `messages`.
6. **Modelos de utilidade** (aprovação da Meta, categoria utilidade, idioma pt_BR).
   Sem modelo aprovado o cron não manda resumo nem lembrete — de propósito, porque
   fora da janela de 24 h a Meta não aceita texto livre.
   - `ordre_lembrete_diario` — corpo: `Oi, {{1}}. Contas de hoje e amanhã: {{2}}. Painel: https://ordre.toqy.com.br/app/vencimentos`
   - `ordre_resumo_semanal` — corpo: `Resumo da semana, {{1}}. Gastos: {{2}}. Semana anterior: {{3}}. Categoria que mais cresceu: {{4}}.`
   - `ordre_resumo_mensal` — corpo: `Fechamento de {{1}}. Gastos {{2}}, receitas {{3}}, saldo {{4}}. Patrimônio líquido: {{5}}.`
   Coloque o nome aprovado na variável correspondente. Horário: todo dia 8h, resumo
   semanal na segunda, fechamento no dia 1. Só para quem ligou os avisos no painel.
7. **Pacote avulso na Kiwify.** Crie o produto (ainda não existe). Webhook o mesmo de
   sempre (`/api/kiwify/webhook`). Copie o id do produto e o link de checkout para as
   variáveis. O crédito cai no mês corrente, no e-mail da conta. Reembolso tira o
   crédito e não cancela o plano anual.
8. **Ligar.** Redeploy com `WHATSAPP_BOT_ENABLED=true`. No painel, Configurações →
   WhatsApp, gere um código e mande `ORDRE-123456` do seu celular.

Custo da Meta (tabela Brasil a partir de 01/10/2026, conferir de novo no rate card
antes de ligar, porque muda no começo de cada trimestre): mensagem que o usuário
manda não é cobrada; resposta de serviço e modelo de utilidade cerca de R$ 0,035;
as primeiras 1.000 mensagens de serviço do mês, por número, são grátis. Para 1.000
pessoas ativas, uma conta de exemplo é cerca de R$ 1,33 por pessoa por mês (30
respostas e 9 avisos), mais o gpt-4o-mini das fotos e das frases que a regra não
resolve. O plano de R$ 97,90/ano cabe nisso com a cota; a cota padrão é 80 ações
por mês. Aviso automático não gasta a cota da pessoa.

O teste de 7 dias usa o bot. No oitavo dia o acesso acaba por completo, no painel e
no WhatsApp. Não há plano grátis.

---

## O que já está pronto e não exige ação sua

- Todas as 8 áreas do painel com CRUD real.
- Escola com 13 aulas (cadeado por plano; vídeos entram quando você gravar).
- Blog com 10 artigos.
- Páginas legais (Termos, Privacidade, Cookies, Contrato, Segurança) — modelos LGPD,
  **peça revisão de um advogado antes de operar comercialmente**.
- SEO: metadata, OG image, robots.txt, sitemap.xml, 404, manifest.
- Segurança: headers (CSP/HSTS/etc.), RLS em todas as tabelas, erros genéricos,
  banner de consentimento, `security.txt`.

## O que ainda será construído (peça quando quiser)

Lista completa em `docs/STATUS.md`. Resumo: webhook Kiwify, IA de investimentos
(Elite), Open Finance (Elite), câmbio real multi-moeda, lookup FIPE, player de vídeo
da Escola, import de extrato OFX/CSV, e-mails transacionais (Resend), tela de MFA,
testes automatizados.
