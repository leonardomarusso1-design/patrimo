# Ordre — status da build

> **Atualização de 2026-11-22.** O app se chama **Ordre** e está no ar em **https://ordre.toqy.com.br**
> (subdomínio do Toqy, projeto `patrimo` na Vercel; o endereço `patrimo-ashy.vercel.app` continua valendo).
> Os nomes técnicos antigos seguem como são: repositório e projeto da Vercel `patrimo`, projeto do Supabase `patrimo`
> (ref `rhztczldzsopjkbaitqg`). O que falta fazer está na seção "Pendências de 2026-11-22" no fim deste arquivo.

Gerado na sessão inicial de construção (2026-09-07). `npm run build` e `npx eslint .`
passam limpos. 43 rotas.

## Pronto e funcional

| Área | Estado |
|---|---|
| Identidade visual "Signal Ledger" | tokens de cor/tipografia (Unbounded + Manrope), pulso de sinal no hero, dark section |
| Landing page | hero que vende sozinho, 8 módulos, diferenciais, comparação vs planilha, preços, escola, blog, CTA, footer |
| Preços | tabela com toggle mensal/anual, 3 tiers (Essencial/Pro/Elite), FAQ |
| Autenticação | e-mail+senha, Google OAuth, recuperação de senha, confirmação por e-mail, rate limit, sessão em cookie httpOnly |
| Onboarding | wizard de 5 passos (moeda, renda, profissão, localidade, termos) |
| Painel — Início | consolidado: saldo do mês, patrimônio líquido, carteira, metas, reserva, atalhos |
| Painel — Visão geral | receita × gastos dos últimos 6 meses (gráfico de área) |
| Painel — Orçamento | receita / despesa fixa / variável, navegação por mês, donut por categoria, CRUD completo |
| Painel — Reserva | nível Básico (6m) / Blindado (12m), custo essencial, aplicações, escudo de progresso |
| Painel — Metas | cards com progresso, aportes, "guarde R$ X/mês", CRUD |
| Painel — Investimentos | valor atual / investido / rendimento, donut por ativo e por classe, CRUD (gate: Pro) |
| Painel — Patrimônio | bens/liquidez + dívidas, patrimônio líquido, composição, CRUD |
| Painel — Escola | 13 aulas com nomes, cadeado por plano, marcar concluída, barra de progresso |
| Painel — Calculadoras | juros compostos, independência (4%), quitação de dívida, 50-30-20 (gate: Pro) |
| Painel — Configurações | editar perfil/moeda, ver plano, canal LGPD |
| Blog | índice + 10 artigos com fontes citadas, renderizador de markdown próprio, JSON-LD |
| Legal | Termos, Privacidade, Cookies, Contrato de Assinatura, Segurança (modelos LGPD, revisar com jurídico) |
| SEO | metadata + OG dinâmica, robots.txt, sitemap.xml (inclui posts), 404, manifest |
| Segurança | CSP/HSTS/headers, RLS em todas as tabelas, rate limiting, erros genéricos, banner de consentimento, security.txt |
| Banco | `supabase/migrations/0001_init.sql` — 16 tabelas, RLS, trigger de criação de profile |

## Precisa de você / ambiente

- **Projeto Supabase**: ✅ criado — `patrimo` (ref `rhztczldzsopjkbaitqg`, org Marusso
  Produções, região sa-east-1). Migrations `0001_init` + `0002_harden_functions`
  aplicadas, 15 tabelas com RLS, advisors de segurança zerados. `.env.local` já
  preenchido com URL + anon key. Testado ponta a ponta (cadastro → onboarding →
  lançamento no orçamento → persistiu no banco).
  - **Falta**: em Authentication → Providers, ativar **Google** (client id/secret do
    Google Cloud) e cadastrar as redirect URLs (`http://localhost:3000/auth/callback`
    e a de produção). Email já funciona (confirmação por link).
  - Na Vercel, repetir as env vars e trocar `NEXT_PUBLIC_SITE_URL` para o domínio real.
- **Upstash Redis**: criar e colar `UPSTASH_REDIS_REST_URL/TOKEN` para ativar o rate limiting
  em produção (fail-open sem isso).
- **Kiwify**: criar os produtos dos 3 planos, pegar as URLs de checkout e o segredo do
  webhook (`KIWIFY_WEBHOOK_SECRET`).
- **Cloudflare** na frente do domínio; **Dependabot + Secret Scanning** no GitHub.
- Nome **Ordre**: confirmar a busca de marca no INPI e se vale registrar um domínio próprio (hoje o app usa `ordre.toqy.com.br`).

## Construído depois (sessão 2)

- ✅ **Webhook Kiwify** (`/api/kiwify/webhook`) — HMAC-SHA1, libera/revoga plano, `pending_purchases`.
- ✅ **Plano único** R$ 97,90/ano (12x) + hard paywall + `/ativar`.
- ✅ **Perfil de investidor** — quiz de 5 perguntas, salva em `profiles.investor_profile`,
  mostra alocação-alvo vs. real em renda variável na tela de Investimentos.
- ✅ **Bem financiado vinculado à dívida** — `patrimony_items.linked_debt_id` +
  `appraised_value`. Patrimônio líquido = valor de mercado − saldo do financiamento;
  barra de "% quitado" por bem; dívida vinculada não conta duas vezes.
- ✅ **Filtro no Orçamento** — busca por nome + chips de categoria (client-side).
- ✅ **Importar extrato CSV** — parser BR (`;`/`,`, `1.234,56`), preview editável
  (tipo + categoria por linha), insert em lote.
- ✅ **MFA/2FA (TOTP)** — ativar/desativar em Configurações; gate AAL2 em `/mfa` no login.
- ✅ **Consulta FIPE** — proxy `/api/fipe` (parallelum), marca→modelo→ano, adiciona o
  veículo já com valor e código FIPE.
- ✅ **Câmbio real multi-moeda** — `lib/fx.ts` (open.er-api, cache 6h). Investimentos e
  patrimônio convertem cada ativo para a moeda de exibição do perfil.

## Construído depois (sessão 3)

- ✅ **Donut "Despesas por categoria"** — usa container query (`@container`), não estoura
  mais quando o card é estreito.
- ✅ **MonthPicker** — grade de meses + navegação por ano, substitui as setinhas.
  **Período personalizado** (de tal dia a tal dia) via `budget_entries.entry_date`
  (migration 0007). URL: `?from=&to=`.
- ✅ **IA de investimentos** — análise sob demanda na tela de Investimentos. Com
  `OPENAI_API_KEY` usa gpt-4o-mini; sem a chave, cai num fallback por regras (alocação
  vs. perfil). Histórico em `investment_advice` (migration 0008). Rate limit 1/dia.
  Não faz previsão de curto prazo nem indica ativo específico.
- ✅ **E-mails Resend** — "acesso liberado" (no webhook Kiwify) e "boas-vindas" (após
  onboarding). Sem `RESEND_API_KEY` viram no-op (só log). `RESEND_FROM` opcional.
- ✅ **Testes** — vitest, 20 testes de lógica pura (finance, csv, fx, investor, plans).
  `npm test`.

## Ainda não construído

1. **Open Finance** — precisa de conta **Pluggy** ou **Belvo** (client id/secret). Só
   isso destrava. O código de importação via CSV já cobre o caso manual.
2. **Academia** — pronta: 13 aulas + 3 extras com vídeo, legenda e e-book (PR #25).
3. **Cron de análise da IA** — hoje é sob demanda. Um Vercel Cron diário gerando a
   análise para todos os assinantes é opcional (custo de tokens).
4. **Aviso de renovação por e-mail** — falta um cron que olha `plan_expires_at`.

## Pendências de 2026-11-22
1. **Vercel**: a variável `NEXT_PUBLIC_SITE_URL` do projeto `patrimo` precisa valer `https://ordre.toqy.com.br`, com novo deploy
   (ela monta os links dos e-mails, o sitemap e os endereços de retorno do login).
2. **Supabase → Authentication → URL Configuration**: Site URL `https://ordre.toqy.com.br` e Redirect URLs `https://ordre.toqy.com.br/**`
   (mantenha o endereço antigo `patrimo-ashy.vercel.app/**` enquanto houver link antigo em uso).
3. **Kiwify**: o webhook pode continuar no endereço antigo, mas o certo é migrar para `https://ordre.toqy.com.br/api/kiwify/webhook`
   (dá para ter os dois ao mesmo tempo durante a troca).
4. **E-mail (Resend)**: o remetente padrão no código é `Ordre <ola@ordre.app>`, e só funciona se o domínio `ordre.app` for nosso e estiver verificado no Resend
   (não confirmei). Se não estiver, defina `RESEND_FROM` na Vercel com um domínio verificado (por exemplo `Ordre <noreply@toqy.com.br>`).
5. **Segurança**: Next e zod foram atualizados (o Next 16.3.8 tinha falhas críticas). Conferir que o próximo deploy passa.
6. **Banco compartilhado**: o projeto do Supabase `patrimo` também guarda ~22 tabelas que **não são do Ordre** (workspaces, perfis,
   itens_conteudo, personagens, renders, publicacoes e parecidas). São do painel de conteúdo da **tropa dos bots** (o "Motor"), que
   usa este mesmo projeto de propósito (confirmado pelo Leonardo em 2026-11-22). Nenhuma migration deste repositório as cria e elas
   não devem ser apagadas nem alteradas daqui. Qualquer limpeza ou migração deste banco precisa tratar os dois apps.
7. **Redes e contato**: o Instagram `@ordre.app` e o domínio `ordre.app` aparecem nas páginas legais e no rodapé. Conferir se existem.
8. Itens antigos que continuam abertos: Google no login, Upstash Redis (limite de tentativas), produtos e segredo do webhook da Kiwify,
   Cloudflare, Dependabot e Secret Scanning, Open Finance (Pluggy), player de vídeo da Escola, cron de análise da IA.
