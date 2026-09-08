import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PLAN } from "@/lib/plans";
import { formatCurrency } from "@/lib/utils";

export function TrialBanner({ days }: { days: number }) {
  return (
    <Link
      href="/ativar"
      className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-[#8a5e00]"
    >
      <span className="flex items-center gap-2 font-medium">
        <Sparkles className="h-4 w-4" />
        {days > 0
          ? `Teste grátis — ${days} dia${days === 1 ? "" : "s"} restante${days === 1 ? "" : "s"}.`
          : "Seu teste grátis acaba hoje."}
      </span>
      <span className="font-semibold underline">
        Assinar por {formatCurrency(PLAN.price, "BRL")}/ano →
      </span>
    </Link>
  );
}
