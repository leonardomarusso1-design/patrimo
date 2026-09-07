import { Suspense } from "react";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { LoginForm } from "@/components/auth/AuthForms";
import { GoogleButton } from "@/components/auth/GoogleButton";

export const metadata = pageMetadata({
  title: "Entrar",
  path: "/login",
  noindex: true,
});

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink">Entrar</h1>
      <p className="mt-1 text-sm text-muted">Bem-vindo de volta. Acesse sua conta.</p>

      <div className="mt-8">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton />

      <p className="mt-6 text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-accent-dim hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
