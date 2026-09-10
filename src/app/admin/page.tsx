import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN } from "@/lib/plans";
import { formatCurrency, formatDate } from "@/lib/utils";

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default async function AdminHome() {
  const db = createAdminClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const in30 = new Date(now.getTime() + 30 * 86400000).toISOString();

  const [total, paid, trials, expiring, recent, pending, adviceCount] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .neq("plan", "free")
      .is("trial_started_at", null)
      .or(`plan_expires_at.is.null,plan_expires_at.gt.${nowIso}`),
    db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .not("trial_started_at", "is", null)
      .gt("plan_expires_at", nowIso),
    db
      .from("profiles")
      .select("id, email, full_name, plan_expires_at")
      .neq("plan", "free")
      .not("plan_expires_at", "is", null)
      .gt("plan_expires_at", nowIso)
      .lt("plan_expires_at", in30)
      .order("plan_expires_at", { ascending: true }),
    db
      .from("profiles")
      .select("id, email, full_name, plan, plan_expires_at, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    db.from("pending_purchases").select("email, plan, expires_at, created_at").order("created_at", { ascending: false }),
    db.from("investment_advice").select("id", { count: "exact", head: true }),
  ]);

  const paidCount = paid.count ?? 0;
  const arr = paidCount * PLAN.price;

  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink">Resumo</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Contas" value={String(total.count ?? 0)} />
        <Tile label="Assinantes pagos" value={String(paidCount)} sub={`+ ${trials.count ?? 0} em teste grátis`} />
        <Tile label="Receita anual" value={formatCurrency(arr, "BRL")} sub={`${paidCount} × ${formatCurrency(PLAN.price, "BRL")}`} />
        <Tile label="Análises IA geradas" value={String(adviceCount.count ?? 0)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-base font-bold text-ink">Vencendo em 30 dias</h2>
          {(expiring.data ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-muted">Ninguém vencendo.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border text-sm">
              {(expiring.data ?? []).map((p) => (
                <li key={p.id} className="flex justify-between py-2">
                  <span className="text-ink">{p.full_name || p.email}</span>
                  <span className="tabular-nums text-muted">{formatDate(p.plan_expires_at!)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink">Compras sem conta ainda</h2>
            <span className="text-xs text-muted">{(pending.data ?? []).length}</span>
          </div>
          {(pending.data ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nenhuma pendente.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border text-sm">
              {(pending.data ?? []).map((p) => (
                <li key={p.email} className="flex justify-between py-2">
                  <span className="text-ink">{p.email}</span>
                  <span className="tabular-nums text-muted">{formatDate(p.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-ink">Últimas contas</h2>
          <Link href="/admin/assinantes" className="text-xs text-accent-dim hover:underline">
            ver todas
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-border text-sm">
          {(recent.data ?? []).map((p) => (
            <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2">
              <span className="text-ink">{p.full_name || p.email}</span>
              <span className="text-muted">
                {p.plan === "free" ? "grátis" : "pago"} · {formatDate(p.created_at)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
