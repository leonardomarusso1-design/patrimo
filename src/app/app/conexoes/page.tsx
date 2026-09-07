import { RefreshCw, Trash2, Landmark } from "lucide-react";
import { requireUser } from "@/lib/data";
import { pluggyConfigured } from "@/lib/pluggy";
import { PageHeader } from "@/components/app/PageHeader";
import { PluggyButton } from "@/components/app/PluggyButton";
import { EmptyState } from "@/components/ui/Misc";
import { formatDate } from "@/lib/utils";
import { syncConnection, removeConnection } from "./actions";
import type { Tables } from "@/types/database";

export const metadata = { title: "Contas conectadas" };

type Conn = Tables<"bank_connections">;

export default async function ConexoesPage() {
  const { user, supabase } = await requireUser();
  const { data } = await supabase
    .from("bank_connections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  const conns = (data ?? []) as Conn[];
  const configured = pluggyConfigured();

  return (
    <>
      <PageHeader
        title="Contas conectadas"
        subtitle="Conecte seu banco via Open Finance e as transações entram no Orçamento sozinhas."
        action={configured ? <PluggyButton /> : undefined}
      />

      {!configured ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted shadow-[var(--shadow-card)]">
          Open Finance ainda não está ativo. Configure <code>PLUGGY_CLIENT_ID</code> e{" "}
          <code>PLUGGY_CLIENT_SECRET</code> nas variáveis de ambiente.
        </div>
      ) : conns.length === 0 ? (
        <EmptyState
          icon={<Landmark className="h-8 w-8" />}
          title="Nenhum banco conectado"
          description="Ao conectar, buscamos os últimos 90 dias de transações e mantemos sincronizado. Você aprova o acesso no seu banco e pode revogar quando quiser."
          action={<PluggyButton label="Conectar meu primeiro banco" />}
        />
      ) : (
        <ul className="space-y-3">
          {conns.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <div>
                <p className="font-display text-base font-bold text-ink">
                  {c.institution_name ?? "Banco"}
                </p>
                <p className="text-xs text-muted">
                  {c.status === "connected" || c.status === "UPDATED"
                    ? "conectado"
                    : c.status}
                  {c.last_synced_at
                    ? ` · última sincronização ${formatDate(c.last_synced_at)}`
                    : " · ainda não sincronizado"}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={syncConnection}>
                  <input type="hidden" name="item_id" value={c.pluggy_item_id} />
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:text-ink">
                    <RefreshCw className="h-3.5 w-3.5" /> Sincronizar
                  </button>
                </form>
                <form action={removeConnection}>
                  <input type="hidden" name="item_id" value={c.pluggy_item_id} />
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:border-danger/40 hover:text-danger">
                    <Trash2 className="h-3.5 w-3.5" /> Remover
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-muted">
        Transações importadas entram como <strong>despesa variável</strong> (saídas) ou{" "}
        <strong>receita</strong> (entradas). Ajuste tipo e categoria no Orçamento. Nada
        é cobrado nem movimentado — leitura apenas.
      </p>
    </>
  );
}
