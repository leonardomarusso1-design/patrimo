import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { ResetForm } from "@/components/auth/AuthForms";

export const metadata = pageMetadata({
  title: "Recuperar senha",
  path: "/recuperar-senha",
  noindex: true,
});

export default async function RecuperarSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink">Recuperar senha</h1>
      <p className="mt-1 text-sm text-muted">
        Digite o e-mail da conta e enviamos um link para redefinir.
      </p>
      {erro === "link" && (
        <p className="mt-4 rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger" role="alert">
          Esse link venceu ou foi aberto em outro aparelho. Peça um novo abaixo e abra no mesmo navegador em que pediu.
        </p>
      )}
      <div className="mt-8">
        <ResetForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-semibold text-accent-dim hover:underline">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
