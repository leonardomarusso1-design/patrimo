import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { StatTile, Progress } from "@/components/ui/Misc";
import { formatCurrency } from "@/lib/utils";
import { emergencyTarget } from "@/lib/finance";
import { planAllows } from "@/lib/plans";

export const metadata = { title: "Início" };

function monthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default async function InicioPage() {
  const [{ user, supabase }, profile] = await Promise.all([requireUser(), getProfile()]);
  const cur = profile.display_currency;
  const ref = monthStart();

  const [budget, fund, reserves, goals, contribs, invest, items, debts] = await Promise.all([
    supabase.from("budget_entries").select("kind, amount").eq("user_id", user.id).eq("reference_month", ref),
    supabase.from("emergency_fund").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("emergency_reserves").select("amount").eq("user_id", user.id),
    supabase.from("goals").select("id, target_amount").eq("user_id", user.id).eq("archived", false),
    supabase.from("goal_contributions").select("amount").eq("user_id", user.id),
    supabase.from("investments").select("current_amount, invested_amount").eq("user_id", user.id),
    supabase.from("patrimony_items").select("value").eq("user_id", user.id),
    supabase.from("debts").select("remaining_amount").eq("user_id", user.id),
  ]);

  const b = budget.data ?? [];
  const income = b.filter((r) => r.kind === "income").reduce((s, r) => s + Number(r.amount), 0);
  const expense = b.filter((r) => r.kind !== "income").reduce((s, r) => s + Number(r.amount), 0);
  const monthBalance = income - expense;

  const reserveSaved = (reserves.data ?? []).reduce((s, r) => s + Number(r.amount), 0);
  const reserveTarget = emergencyTarget(
    Number(fund.data?.essential_monthly_cost ?? 0),
    (fund.data?.protection_level ?? "basic") as "basic" | "shield",
  );
  const reservePct = reserveTarget > 0 ? (reserveSaved / reserveTarget) * 100 : 0;

  const goalsTarget = (goals.data ?? []).reduce((s, r) => s + Number(r.target_amount), 0);
  const goalsSaved = (contribs.data ?? []).reduce((s, r) => s + Number(r.amount), 0);

  const walletValue = (invest.data ?? []).reduce((s, r) => s + Number(r.current_amount), 0);
  const assetsTotal = (items.data ?? []).reduce((s, r) => s + Number(r.value), 0);
  const debtsTotal = (debts.data ?? []).reduce((s, r) => s + Number(r.remaining_amount), 0);
  const netWorth = assetsTotal + walletValue + reserveSaved - debtsTotal;

  const shortcuts = [
    { href: "/app/orcamento", label: "Lançar no orçamento" },
    { href: "/app/metas", label: "Registrar aporte em meta" },
    { href: "/app/investimentos", label: "Atualizar carteira" },
    { href: "/app/escola", label: "Continuar a Escola" },
  ];

  return (
    <>
      <PageHeader title="Seu dinheiro hoje" subtitle="O retrato do mês e do patrimônio." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Saldo do mês"
          value={formatCurrency(monthBalance, cur)}
          tone="ink"
          hint={monthBalance >= 0 ? "sobrando este mês" : "no vermelho este mês"}
        />
        <StatTile label="Patrimônio líquido" value={formatCurrency(netWorth, cur)} />
        <StatTile
          label="Carteira"
          value={planAllows(profile.plan, "pro") ? formatCurrency(walletValue, cur) : "—"}
          hint={planAllows(profile.plan, "pro") ? undefined : "plano Pro"}
        />
        <StatTile label="Metas" value={formatCurrency(goalsSaved, cur)} hint={`de ${formatCurrency(goalsTarget, cur)}`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-ink">Reserva de emergência</h3>
            <Link href="/app/reserva" className="text-sm text-accent-dim hover:underline">
              abrir
            </Link>
          </div>
          <p className="money mt-3 font-display text-2xl font-extrabold text-ink">
            {formatCurrency(reserveSaved, cur)}
            <span className="text-sm font-semibold text-muted"> de {formatCurrency(reserveTarget, cur)}</span>
          </p>
          <div className="mt-2">
            <Progress value={reservePct} tone={reservePct >= 100 ? "success" : "accent"} />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {reserveTarget === 0
              ? "Defina seu custo essencial na aba Reserva."
              : `${Math.round(reservePct)}% protegido`}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="font-display text-base font-bold text-ink">Atalhos</h3>
          <ul className="mt-3 divide-y divide-border">
            {shortcuts.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="flex items-center justify-between py-2.5 text-sm text-ink/90 hover:text-ink"
                >
                  {s.label}
                  <ArrowUpRight className="h-4 w-4 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
