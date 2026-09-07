# Patrimo

Controle financeiro pessoal — orçamento, reserva de emergência, metas, investimentos e
patrimônio numa tela só, com escola e blog de educação financeira. PT-BR primeiro,
pronto para multi-moeda.

Stack: **Next.js 16 (App Router) · React 19 · Tailwind v4 · Supabase (Auth + Postgres + RLS) ·
Recharts · Vercel**. Identidade visual "Signal Ledger".

## Rodando local

```bash
cp .env.example .env.local   # preencha as chaves do Supabase
npm install
npm run dev                  # http://localhost:3000
```

A landing, o blog e as páginas legais funcionam sem Supabase. Para login e o painel
(`/app`) você precisa de um projeto Supabase configurado (abaixo).

## Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Aplique a migration `supabase/migrations/0001_init.sql` (via `npx supabase db push`
   após `npx supabase link`, ou colando o SQL no SQL Editor do painel).
3. Em **Authentication → Providers**, ative **Email** e **Google**. Redirect URLs:
   `http://localhost:3000/auth/callback` e `https://SEU_DOMINIO/auth/callback`.
4. Em **Authentication → URL Configuration**, defina o Site URL.
5. Copie `Project URL` e `anon key` para o `.env.local`.
6. (Recomendado) ative MFA em Authentication → settings.

## Variáveis de ambiente

Veja `.env.example`. Mínimo para o painel: `NEXT_PUBLIC_SITE_URL`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
`UPSTASH_*` e `NEXT_PUBLIC_GA_ID` são opcionais.

## Deploy

- **Vercel**: importe o repo, cole as env vars, deploy. HTTPS e headers de segurança
  vêm do `next.config.ts`.
- **Cloudflare** na frente do domínio (proxy) para WAF + DDoS + esconder IP de origem.
- **GitHub**: ative Dependabot e Secret Scanning no repositório.

## Segurança

Sessão em cookie httpOnly (`@supabase/ssr`), RLS em 100% das tabelas, rate limiting nos
endpoints sensíveis, erros genéricos ao cliente, CSP/HSTS/X-Frame-Options, banner de
consentimento LGPD, `/.well-known/security.txt`, `robots.txt`, `sitemap.xml`, página 404,
OG image dinâmica. Detalhes em `/seguranca` e `docs/STATUS.md`.

## Estrutura

```
src/
  app/
    (auth)/     login, cadastro, recuperar-senha
    (site)/     precos, blog, páginas legais
    app/        painel: início, visão-geral, orçamento, reserva, metas,
                investimentos, patrimônio, escola, calculadoras, configurações
    auth/       callback, confirm, server actions
    onboarding/ wizard de 5 passos
  components/   ui/, marketing/, app/, auth/
  content/blog.ts   10 artigos
  lib/          supabase/, plans, school, finance, seo, data, rate-limit
supabase/migrations/   schema + RLS
```
"# patrimo" 
