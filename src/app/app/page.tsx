import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Circle, AlertTriangle, Info } from "lucide-react";
import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { StatTile, Progress } from "@/components/ui/Misc";
import { formatCurrency } from "@/lib/utils";
import { emergencyTarget } from "@/lib/finance";
import { computeNetWorth } from "@/lib/networth";
import { buildAlerts } from "@/lib/alerts";
import { getIndicators } from "@/lib/market";
import { IndicadoresPanel } from "@/components/app/IndicadoresPanel";

export const metadata = { title: "Início" };

function monthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default async function InicioPage() {
  const [{ user, supabase }, profile, indicators] = await Promise.all([
    requireUser(),
    getProfile(),
    getIndicators(),
  ]);
  const cur = profile.display_currency;
  const ref = monthStart();
  const monthName = new Date().toLocaleDateString("pt-BR", { month: "long" });

  const nw = await computeNetWorth(supabase, user.id, cur);

  const [budget, fund, goals, contribs] = await Promise.all([
    supabase.from("budget_entries").select("kind, amount").eq("user_id", user.id).eq("reference_month", ref),
    supabase.from("emergency_fund").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("goals")
      .select("id, name, target_amount, deadline")
      .eq("user_id", user.id)
      .eq("archived", false),
    supabase.from("goal_contributions").select("goal_id, amount").eq("user_id", user.id),
  ]);

  const b = budget.data ?? [];
  const income = b.filter((r) => r.kind === "income").reduce((s, r) => s + Number(r.amount), 0);
  const expense = b.filter((r) => r.kind !== "income").reduce((s, r) => s + Number(r.amount), 0);
  const variable = b.filter((r) => r.kind === "expense_variable").reduce((s, r) => s + Number(r.amount), 0);
  const monthBalance = income - expense;

  const reserveSaved = nw.reserve;
  const reserveTarget = emergencyTarget(
    Number(fund.data?.essential_monthly_cost ?? 0),
    (fund.data?.protection_level ?? "basic") as "basic" | "shield",
  );
  const reservePct = reserveTarget > 0 ? (reserveSaved / reserveTarget) * 100 : 0;

  const savedByGoal = new Map<string, number>();
  for (const c of contribs.data ?? []) {
    savedByGoal.set(c.goal_id, (savedByGoal.get(c.goal_id) ?? 0) + Number(c.amount));
  }
  const goalsList = goals.data ?? [];
  const goalsTarget = goalsList.reduce((s, g) => s + Number(g.target_amount), 0);
  const goalsSaved = [...savedByGoal.values()].reduce((s, v) => s + v, 0);

  const alerts = buildAlerts({
    currency: cur,
    monthIncome: income,
    monthExpense: expense,
    variable,
    reserveSaved,
    reserveTarget,
    goals: goalsList.map((g) => ({
      name: g.name,
      target: Number(g.target_amount),
      saved: savedByGoal.get(g.id) ?? 0,
      deadline: g.deadline,
    })),
  });

  const shortcuts = [
    { href: "/app/orcamento", label: "Lançar no orçamento" },
    { href: "/app/metas", label: "Registrar aporte em meta" },
    { href: "/app/investimentos", label: "Atualizar carteira" },
    { href: "/app/escola", label: "Continuar a Escola" },
  ];

  const setup = [
    { href: "/app/orcamento?new=income", label: "Lance sua renda e as despesas do mês", done: b.length > 0 },
    { href: "/app/reserva", label: "Defina o custo essencial da sua reserva", done: Number(fund.data?.essential_monthly_cost ?? 0) > 0 },
    { href: "/app/metas", label: "Crie sua primeira meta", done: goalsList.length > 0 },
  ];
  const setupDone = setup.filter((s) => s.done).length;

  const alertStyle = {
    danger: "border-danger/30 bg-danger/10 text-danger",
    warn: "border-gold/40 bg-gold/10 text-[#8a5e00]",
    info: "border-brand/30 bg-brand-50 text-brand-700",
  } as const;

  return (
    <>
      <PageHeader title="Seu dinheiro hoje" subtitle="O retrato do mês e do patrimônio." />

      <div className="mb-6">
        <IndicadoresPanel data={indicators} />
      </div>

      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((a, i) => (
            <Link
              key={i}
              href={a.href}
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${alertStyle[a.level]}`}
            >
              {a.level === "info" ? (
                <Info className="h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              )}
              <span className="flex-1">{a.text}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-70" />
            </Link>
          ))}
        </div>
      )}

      {setupDone < setup.length && (
        <div className="mb-6 rounded-2xl border border-brand/30 bg-brand-50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-brand-700">Primeiros passos</h3>
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
                  <span className={s.done ? "line-through opacity-60" : "font-medium"}>{s.label}</span>
                  {!s.done && <ArrowUpRight className="ml-auto h-4 w-4" />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="mb-3 font-display text-base font-bold text-ink">Resumo de hoje</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Saldo do mês"
          value={formatCurrency(monthBalance, cur)}
          tone="ink"
          hint={`receitas − despesas de ${monthName}`}
        />
        <StatTile
          label="Patrimônio líquido"
          value={formatCurrency(nw.netWorth, cur)}
          hint="bens + investimentos + reserva − dívidas"
        />
        <StatTile
          label="Investido na carteira"
          value={nw.wallet > 0 ? formatCurrency(nw.wallet, cur) : "R$ 0,00"}
          hint={nw.wallet > 0 ? "valor atual dos seus investimentos" : "nenhum investimento lançado ainda"}
        />
        <StatTile
          label="Guardado em metas"
          value={formatCurrency(goalsSaved, cur)}
          hint={goalsTarget > 0 ? `de ${formatCurrency(goalsTarget, cur)} planejados` : "nenhuma meta criada ainda"}
        />
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
