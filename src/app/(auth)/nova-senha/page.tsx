import Link from "next/link";
import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { NewPasswordForm } from "@/components/auth/AuthForms";

export const metadata = pageMetadata({
  title: "Nova senha",
  path: "/nova-senha",
  noindex: true,
});

// Destino do link de "esqueci a senha" (e do "Alterar senha" em Configurações). Só abre com sessão: o link do e-mail
// já entra na conta (rota /auth/callback); sem sessão (link vencido ou aberto direto), volta para pedir um novo.
export default async function NovaSenhaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/recuperar-senha");

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink">Definir nova senha</h1>
      <p className="mt-1 text-sm text-muted">Escolha a senha que você vai usar para entrar no Ordre.</p>
      <div className="mt-8">
        <NewPasswordForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/app" className="font-semibold text-accent-dim hover:underline">
          Voltar para o painel
        </Link>
      </p>
    </div>
  );
}
