"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

/**
 * Botão flutuante mobile: atalho pra lançar despesa variável.
 * Abre o Orçamento já com o formulário de despesa variável aberto (?new=variable).
 * Some quando já se está no Orçamento pra não competir com o "Adicionar" da tela.
 */
export function QuickExpenseFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/app/orcamento")) return null;

  return (
    <Link
      href="/app/orcamento?new=variable"
      aria-label="Lançar gasto"
      className="fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-bold text-[#eaf5ee] shadow-[0_10px_30px_-8px_rgba(11,122,85,0.55)] active:scale-95 lg:hidden"
    >
      <Plus className="h-5 w-5" aria-hidden="true" />
      Gasto
    </Link>
  );
}
