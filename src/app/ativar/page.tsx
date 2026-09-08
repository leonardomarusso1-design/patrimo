import { redirect } from "next/navigation";
import { RefreshCw, Check, ShieldCheck } from "lucide-react";
import { getProfile } from "@/lib/data";
import { hasActiveAccess, PLAN } from "@/lib/plans";
import { formatCurrency } from "@/lib/utils";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/marketing/Wordmark";
import { signOut } from "@/app/auth/actions";
import { revalidatePath } from "next/cache";

export const metadata = { title: "Ativar acesso", robots: { index: false } };

async function recheck() {
  "use server";
  revalidatePath("/ativar");
  redirect("/app");
}

export default async function AtivarPage() {
  const profile = await getProfile();
  if (!profile.onboarding_completed) redirect("/onboarding");
  if (hasActiveAccess(profile)) redirect("/app");

  const checkout = `${PLAN.checkoutUrl}?email=${encodeURIComponent(profile.email)}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Wordmark />
          <form action={signOut}>
            <button className="text-sm text-muted hover:text-ink">Sair</button>
          </form>
        </div>

        <div className="rounded-2xl border border-brand bg-card p-7 shadow-[var(--shadow-glow)]">
          <div className="flex items-center gap-2 text-brand">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Falta um passo
            </span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-extrabold text-ink">
            Ative seu acesso ao Ordre
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sua conta está pronta, {profile.full_name?.split(" ")[0] ?? "tudo certo"}.
            Assine para liberar o painel completo.
          </p>

          <p className="mt-6 font-display text-4xl font-extrabold text-ink">
            {formatCurrency(PLAN.price)}
            <span className="text-base font-semibold text-muted">/ano</span>
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2">
            <span className="font-display text-sm font-bold text-brand-700">
              ou {PLAN.installments}x de {formatCurrency(PLAN.installmentValue)}
            </span>
            <span className="text-xs text-brand-700/80">no cartão</span>
          </div>

          <ButtonLink href={checkout} className="mt-6 w-full">
            Pagar com a Kiwify
          </ButtonLink>
          <p className="mt-2 text-center text-xs text-muted">
            Pix, boleto ou cartão em até 12x. O acesso libera automaticamente após a
            confirmação.
          </p>

          <ul className="mt-6 space-y-2 border-t border-border pt-6">
            {PLAN.features.slice(0, 5).map((f) => (
              <li key={f} className="flex gap-2.5 text-sm text-ink/90">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <form action={recheck} className="mt-4 text-center">
          <Button type="submit" variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" /> Já paguei — atualizar
          </Button>
        </form>
      </div>
    </main>
  );
}
