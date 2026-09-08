import Link from "next/link";
import { getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { SettingsForm } from "./ui";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { MfaSetup } from "@/components/app/MfaSetup";
import { PLAN, hasActiveAccess } from "@/lib/plans";
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
          <ThemeToggle current={profile.theme} />

          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Assinatura</p>
            <p className="mt-1 font-display text-xl font-extrabold text-ink">
              {hasActiveAccess(profile) ? PLAN.name : "Sem acesso"}
            </p>
            {profile.plan_expires_at && (
              <p className="text-xs text-muted">
                {hasActiveAccess(profile) ? "válida até" : "expirou em"}{" "}
                {formatDate(profile.plan_expires_at)}
              </p>
            )}
            {!hasActiveAccess(profile) && (
              <Link
                href="/ativar"
                className="mt-4 inline-block text-sm font-semibold text-accent-dim hover:underline"
              >
                Ativar meu acesso →
              </Link>
            )}
          </div>

          <MfaSetup />

          <div className="rounded-2xl border border-border bg-card p-5 text-sm shadow-[var(--shadow-card)]">
            <p className="font-display font-bold text-ink">Seus dados</p>
            <p className="mt-2 text-muted">
              Você pode exportar ou solicitar a exclusão da sua conta e dos seus dados
              a qualquer momento, conforme a LGPD.
            </p>
            <a
              href="mailto:leonardomarusso1@gmail.com?subject=Solicitação LGPD - Ordre"
              className="mt-3 inline-block font-semibold text-accent-dim hover:underline"
            >
              Falar com leonardomarusso1@gmail.com
            </a>
          </div>

          <p className="text-xs text-muted">
            {PLAN.name}: R$ 97,90/ano, em até 12x no cartão. Gestão da cobrança pela
            Kiwify.
          </p>
        </div>
      </div>
    </>
  );
}
