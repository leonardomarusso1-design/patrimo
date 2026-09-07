# Patrimo — status da build

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
- Nome **Patrimo** e domínio `patrimo.com.br` / `patrimo.app` — confirmar registro e INPI.

## Ainda não construído (fases seguintes)

1. **Webhook Kiwify** (`/api/kiwify/webhook`) — ativar/renovar/cancelar plano na tabela
   `subscriptions` + `profiles.plan`. Hoje o plano só muda direto no banco.
2. **IA de investimentos (Elite)** — job diário lendo o mercado + sugestão por perfil.
   Estrutura de perfil de investidor ainda não coletada.
3. **Open Finance (Elite)** — integração com agregador (Pluggy/Belvo) para importar
   transações. Botão "Importar extrato" no Orçamento ainda é placeholder.
4. **Câmbio real multi-moeda** — hoje cada registro guarda sua moeda; falta a taxa de
   conversão aplicada no consolidado (a moeda de exibição do perfil já existe).
5. **Tabela FIPE** — campo `fipe_code` existe; falta o lookup de marca/modelo/ano.
6. **Player de vídeo da Escola** — aulas ficam "em gravação"; plugar o host de vídeo
   quando os conteúdos existirem.
7. **Importar extrato (OFX/CSV)** no Orçamento.
8. **E-mail transacional (Resend)** — boas-vindas, aviso de renovação.
9. **MFA na UI** — Supabase suporta; falta a tela de ativação em Configurações.
10. **Testes** — só o build/lint como gate hoje.
