import Link from "next/link";
import { Lock } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { planName } from "@/lib/plans";
import type { PlanId } from "@/types/database";

export const metadata = { title: "Recurso bloqueado", robots: { index: false } };

export default async function SemAcessoPage({
  searchParams,
}: {
  searchParams: Promise<{ f?: string; need?: string }>;
}) {
  const { f, need } = await searchParams;
  const feature = f ?? "Esse recurso";
  const requiredPlan = (need as PlanId) ?? "pro";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-ink/[0.06] p-4">
        <Lock className="h-6 w-6 text-ink" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-extrabold text-ink">
        {feature} está no plano {planName(requiredPlan)}
      </h1>
      <p className="mt-2 max-w-sm text-muted">
        Faça upgrade para desbloquear. Você mantém tudo que já registrou.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href={`/cadastro?plano=${requiredPlan}`}>
          Ver plano {planName(requiredPlan)}
        </ButtonLink>
        <ButtonLink href="/app" variant="secondary">
          Voltar ao painel
        </ButtonLink>
      </div>
      <Link href="/precos" className="mt-6 text-sm text-accent-dim hover:underline">
        Comparar todos os planos
      </Link>
    </main>
  );
}
