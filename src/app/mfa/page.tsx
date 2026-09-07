import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Wordmark } from "@/components/marketing/Wordmark";
import { MfaChallenge } from "./ui";

export const metadata = { title: "Verificação", robots: { index: false } };

export default async function MfaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel === aal?.nextLevel) redirect("/app");

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factorId = factors?.totp?.find((f) => f.status === "verified")?.id;
  if (!factorId) redirect("/app");

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Wordmark />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-ink">Verificação em duas etapas</h1>
        <p className="mt-1 text-sm text-muted">
          Digite o código de 6 dígitos do seu app autenticador.
        </p>
        <div className="mt-6">
          <MfaChallenge factorId={factorId} />
        </div>
      </div>
    </main>
  );
}
