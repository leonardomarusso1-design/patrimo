import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Circle } from "lucide-react";
import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { StatTile, Progress } from "@/components/ui/Misc";
import { formatCurrency } from "@/lib/utils";
import { emergencyTarget } from "@/lib/finance";
import { planAllows } from "@/lib/plans";
import { getRates, convert } from "@/lib/fx";

export const metadata = { title: "Início" };

function monthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default async function InicioPage() {
  const [{ user, supabase }, profile, rates] = await Promise.all([
    requireUser(),
    getProfile(),
    getRates(),
  ]);
  const cur = profile.display_currency;
  const ref = monthStart();

  const [budget, fund, reserves, goals, contribs, invest, items, debts] = await Promise.all([
    supabase.from("budget_entries").select("kind, amount").eq("user_id", user.id).eq("reference_month", ref),
    supabase.from("emergency_fund").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("emergency_reserves").select("amount").eq("user_id", user.id),
    supabase.from("goals").select("id, target_amount").eq("user_id", user.id).eq("archived", false),
    supabase.from("goal_contributions").select("amount").eq("user_id", user.id),
    supabase.from("investments").select("current_amount, currency").eq("user_id", user.id),
    supabase.from("patrimony_items").select("value, appraised_value, currency, linked_debt_id").eq("user_id", user.id),
    supabase.from("debts").select("id, remaining_amount").eq("user_id", user.id),
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

  const walletValue = (invest.data ?? []).reduce(
    (s, r) => s + convert(Number(r.current_amount), r.currency ?? "BRL", cur, rates),
    0,
  );
  const debtBal = new Map(
    (debts.data ?? []).map((d) => [d.id, Number(d.remaining_amount)]),
  );
  // patrimônio dos bens = valor de mercado − saldo do financiamento vinculado
  const equityAssets = (items.data ?? []).reduce((s, it) => {
    const mv = convert(
      Number(it.appraised_value ?? it.value),
      it.currency ?? "BRL",
      cur,
      rates,
    );
    const linked = it.linked_debt_id ? (debtBal.get(it.linked_debt_id) ?? 0) : 0;
    return s + (mv - linked);
  }, 0);
  const linkedIds = new Set(
    (items.data ?? []).map((i) => i.linked_debt_id).filter(Boolean) as string[],
  );
  const freeDebtsTotal = (debts.data ?? [])
    .filter((d) => !linkedIds.has(d.id))
    .reduce((s, d) => s + Number(d.remaining_amount), 0);
  const netWorth = equityAssets + walletValue + reserveSaved - freeDebtsTotal;

  const shortcuts = [
    { href: "/app/orcamento", label: "Lançar no orçamento" },
    { href: "/app/metas", label: "Registrar aporte em meta" },
    { href: "/app/investimentos", label: "Atualizar carteira" },
    { href: "/app/escola", label: "Continuar a Escola" },
  ];

  const setup = [
    {
      href: "/app/orcamento?new=income",
      label: "Lance sua renda e as despesas do mês",
      done: b.length > 0,
    },
    {
      href: "/app/reserva",
      label: "Defina o custo essencial da sua reserva",
      done: Number(fund.data?.essential_monthly_cost ?? 0) > 0,
    },
    {
      href: "/app/metas",
      label: "Crie sua primeira meta",
      done: (goals.data ?? []).length > 0,
    },
  ];
  const setupDone = setup.filter((s) => s.done).length;

  return (
    <>
      <PageHeader title="Seu dinheiro hoje" subtitle="O retrato do mês e do patrimônio." />

      {setupDone < setup.length && (
        <div className="mb-6 rounded-2xl border border-brand/30 bg-brand-50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-brand-700">
              Primeiros passos
            </h3>
            <span className="text-xs font-semibold text-brand-700">
              {setupDone}/{setup.length}
            </span>
          </div>
          <ul className="mt-3 divide-y divide-brand/15">
            {setup.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="flex items-center gap-3 py-2.5 text-sm text-brand-700 hover:underline"
                >
                  {s.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 opacity-50" />
                  )}
                  <span className={s.done ? "line-through opacity-60" : "font-medium"}>
                    {s.label}
                  </span>
                  {!s.done && <ArrowUpRight className="ml-auto h-4 w-4" />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

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
