import { Lock, Landmark } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";

export const metadata = { title: "Open Finance" };

// Open Finance (Pluggy) está pronto no backend, mas em modo demo.
// Liberamos para clientes depois de revisar o acesso de produção.
export default function ConexoesPage() {
  return (
    <>
      <PageHeader
        title="Open Finance"
        subtitle="Conecte seu banco via Open Finance e as transações entram no Orçamento sozinhas."
      />

      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent-dim">
          <Lock className="h-6 w-6" />
        </div>
        <p className="mt-4 font-display text-lg font-bold text-ink">Em construção</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Estamos finalizando a conexão automática com bancos via Open Finance. Assim que
          liberar, você conecta o banco, aprova o acesso e as transações entram no{" "}
          <Landmark className="inline h-4 w-4 align-text-bottom" /> Orçamento sozinhas —
          leitura apenas, nada é cobrado nem movimentado.
        </p>
        <p className="mt-4 text-xs text-muted">
          Enquanto isso, lance suas movimentações direto no Orçamento.
        </p>
      </div>
    </>
  );
}
