# Modelos de e-mail do Supabase (Ordre)

Colar em Supabase > Authentication > Email Templates (projeto `patrimo`). O assunto de cada um fica no campo "Subject".
Os links usam `{{ .SiteURL }}`, então o **Site URL** em Authentication > URL Configuration precisa ser `https://ordre.toqy.com.br`.
Cada link aponta para `/auth/confirm` com `token_hash` (funciona em qualquer navegador, sem depender de o link ser aberto
onde foi pedido). O `next` leva para a tela certa depois de confirmar.

| Modelo no Supabase | Arquivo | Assunto sugerido | Depois do clique |
|---|---|---|---|
| Confirm signup | `confirmar-cadastro.html` | Confirme o seu e-mail no Ordre | /onboarding |
| Reset Password | `redefinir-senha.html` | Redefina a sua senha do Ordre | /nova-senha |
| Change Email Address | `alterar-email.html` | Confirme o novo e-mail da sua conta no Ordre | /app/configuracoes |

Magic Link, Invite User e Reauthentication não são usados pelo app hoje; deixe como estão.
