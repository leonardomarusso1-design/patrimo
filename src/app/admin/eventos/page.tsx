import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

export default async function EventosPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("webhook_events")
    .select("id, provider, event_type, order_ref, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = data ?? [];

  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink">Webhooks recebidos</h1>
      <p className="mt-1 text-sm text-muted">
        Últimos {rows.length} eventos processados (Kiwify). Cada linha já foi tratada uma vez —
        reenvios idênticos são ignorados.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted">
            <tr className="border-b border-border">
              <th className="px-4 py-2 font-semibold">Quando</th>
              <th className="px-4 py-2 font-semibold">Origem</th>
              <th className="px-4 py-2 font-semibold">Evento</th>
              <th className="px-4 py-2 font-semibold">Pedido</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2 tabular-nums text-muted">{formatDate(e.created_at)}</td>
                <td className="px-4 py-2 text-ink">{e.provider}</td>
                <td className="px-4 py-2 text-muted">{e.event_type ?? "—"}</td>
                <td className="px-4 py-2 font-mono text-xs text-muted">{e.order_ref ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
