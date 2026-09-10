import { createAdminClient } from "@/lib/supabase/admin";
import { isTrial } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export default async function AssinantesPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("profiles")
    .select("id, email, full_name, plan, plan_expires_at, trial_started_at, investor_profile, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = data ?? [];
  const now = new Date().getTime();

  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink">Assinantes</h1>
      <p className="mt-1 text-sm text-muted">{rows.length} contas (máx. 500).</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted">
            <tr className="border-b border-border">
              <th className="px-4 py-2 font-semibold">Conta</th>
              <th className="px-4 py-2 font-semibold">Plano</th>
              <th className="px-4 py-2 font-semibold">Expira</th>
              <th className="px-4 py-2 font-semibold">Perfil</th>
              <th className="px-4 py-2 font-semibold">Entrou</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const active =
                p.plan !== "free" &&
                (!p.plan_expires_at || new Date(p.plan_expires_at).getTime() > now);
              const trial = isTrial(p);
              return (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2">
                    <div className="text-ink">{p.full_name || "—"}</div>
                    <div className="text-xs text-muted">{p.email}</div>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        trial
                          ? "rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-[#8a5e00]"
                          : active
                            ? "rounded-full bg-success/12 px-2 py-0.5 text-xs font-semibold text-success"
                            : "rounded-full bg-ink/[0.06] px-2 py-0.5 text-xs font-semibold text-muted"
                      }
                    >
                      {trial ? "teste" : active ? "pago" : "sem acesso"}
                    </span>
                  </td>
                  <td className="px-4 py-2 tabular-nums text-muted">
                    {p.plan_expires_at ? formatDate(p.plan_expires_at) : "—"}
                  </td>
                  <td className="px-4 py-2 text-muted">{p.investor_profile ?? "—"}</td>
                  <td className="px-4 py-2 tabular-nums text-muted">{formatDate(p.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
