import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePaidAccess } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { PROFILE_INFO } from "@/lib/investor";
import { PerfilQuiz } from "./ui";

export const metadata = { title: "Perfil de investidor" };

export default async function PerfilPage() {
  const profile = await requirePaidAccess();
  const current = profile.investor_profile;

  return (
    <>
      <Link
        href="/app/investimentos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-accent-dim hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Investimentos
      </Link>
      <PageHeader
        title="Descubra seu perfil de investidor"
        subtitle="5 perguntas. Ajusta a carteira sugerida ao seu jeito."
      />

      {current && (
        <div className="mb-6 rounded-2xl border border-brand/40 bg-brand-50 p-4 text-sm text-brand-700">
          Seu perfil atual é <strong>{PROFILE_INFO[current].label}</strong>. Refazer o
          questionário substitui esse resultado.
        </div>
      )}

      <PerfilQuiz />
    </>
  );
}
