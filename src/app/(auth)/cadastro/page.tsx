import { Suspense } from "react";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SignUpForm } from "@/components/auth/AuthForms";
import { GoogleButton } from "@/components/auth/GoogleButton";

export const metadata = pageMetadata({
  title: "Criar conta",
  path: "/cadastro",
  noindex: true,
});

export default function CadastroPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink">Criar conta</h1>
      <p className="mt-1 text-sm text-muted">
        Leva menos de um minuto. Depois é só personalizar.
      </p>

      <div className="mt-8">
        <Suspense fallback={null}>
          <SignUpForm />
        </Suspense>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton label="Cadastrar com Google" />

      <p className="mt-6 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-accent-dim hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
