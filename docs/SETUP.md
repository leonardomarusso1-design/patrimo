# Patrimo — guia de setup passo a passo

Este documento leva o Patrimo do estado atual (código pronto, Supabase provisionado)
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
2. No topo, crie um projeto novo (menu de projetos → "Novo projeto"). Nome: `Patrimo`.
   Aguarde criar e selecione esse projeto.
3. Menu lateral → **APIs e serviços → Tela de permissão OAuth** (OAuth consent screen).
   - Tipo de usuário: **Externo**. Criar.
   - Nome do app: `Patrimo`. E-mail de suporte: o seu. Domínio do desenvolvedor: o seu e-mail.
   - Em "Escopos", não precisa adicionar nada (o padrão `email`, `profile`, `openid` basta).
   - Salvar e continuar até o fim. Pode deixar em modo "Teste" por enquanto (funciona
     com sua conta; publique depois para abrir para todos).
4. Menu lateral → **APIs e serviços → Credenciais** → **Criar credenciais → ID do
   cliente OAuth**.
   - Tipo de aplicativo: **Aplicativo da Web**.
   - Nome: `Patrimo Web`.
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
| `NEXT_PUBLIC_SITE_URL` | `https://patrimo.vercel.app` (troque depois pelo domínio real) |
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

### 4.4 Depois do deploy (domínio atual: `patrimo-ashy.vercel.app`)

1. Volte ao Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `https://patrimo-ashy.vercel.app` (ou o domínio final).
   - **Redirect URLs**: adicione `https://patrimo-ashy.vercel.app/**`.
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

### 4.5 Domínio próprio (quando tiver)

Vercel → **Settings → Domains** → adicione `patrimo.com.br` → siga as instruções de
DNS (apontar registros para a Vercel). Depois refaça o Passo 4.4 com o domínio real.

---

## Passo 5 — Cloudflare (WAF + DDoS)

Faça só depois de ter o domínio.

1. Crie conta em `https://cloudflare.com`, **Add a site** → `patrimo.com.br`.
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
   - Tipo: Redis. Nome: `patrimo`. Região: `sa-east-1` (São Paulo) ou a mais próxima.
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
   - URL: `https://patrimo-ashy.vercel.app/api/kiwify/webhook`
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

1. Confirme o registro de `patrimo.com.br` (e `patrimo.app` se quiser) no
   `registro.br`.
2. Faça a busca de marca no INPI (`https://busca.inpi.gov.br`) na classe de software /
   serviços financeiros. "Patrimo" foi checado só em disponibilidade de Instagram na
   fase de brainstorm — a busca formal do INPI ainda não foi feita.

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
