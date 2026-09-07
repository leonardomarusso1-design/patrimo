import Link from "next/link";
import { getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { SettingsForm } from "./ui";
import { planName, PLANS } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const profile = await getProfile();

  return (
    <>
      <PageHeader title="Configurações" subtitle="Seus dados e sua assinatura." />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SettingsForm profile={profile} />

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Plano atual</p>
            <p className="mt-1 font-display text-xl font-extrabold text-ink">
              {planName(profile.plan)}
            </p>
            {profile.plan_expires_at && (
              <p className="text-xs text-muted">renova em {formatDate(profile.plan_expires_at)}</p>
            )}
            {profile.plan === "free" ? (
              <Link
                href="/precos"
                className="mt-4 inline-block text-sm font-semibold text-accent-dim hover:underline"
              >
                Assinar um plano →
              </Link>
            ) : (
              <Link
                href="/precos"
                className="mt-4 inline-block text-sm font-semibold text-accent-dim hover:underline"
              >
                Mudar de plano →
              </Link>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 text-sm shadow-[var(--shadow-card)]">
            <p className="font-display font-bold text-ink">Seus dados</p>
            <p className="mt-2 text-muted">
              Você pode exportar ou solicitar a exclusão da sua conta e dos seus dados
              a qualquer momento, conforme a LGPD.
            </p>
            <a
              href="mailto:privacidade@patrimo.com.br?subject=Solicitação LGPD"
              className="mt-3 inline-block font-semibold text-accent-dim hover:underline"
            >
              Falar com privacidade@patrimo.com.br
            </a>
          </div>

          <p className="text-xs text-muted">
            Planos:{" "}
            {PLANS.map((p) => `${p.name} R$${p.monthly}/mês`).join(" · ")}
          </p>
        </div>
      </div>
    </>
  );
}
