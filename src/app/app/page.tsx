import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Info,
  ArrowLeftRight,
  Wallet,
  Target,
  TrendingUp,
  Landmark,
  Calculator,
} from "lucide-react";
import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { Progress, StatTile } from "@/components/ui/Misc";
import { CustomizeDash } from "@/components/app/CustomizeDash";
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
    supabase.from("budget_entries").select("kind, amount, pending").eq("user_id", user.id).eq("reference_month", ref),
    supabase.from("emergency_fund").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("goals")
      .select("id, name, target_amount, deadline")
      .eq("user_id", user.id)
      .eq("archived", false),
    supabase.from("goal_contributions").select("goal_id, amount").eq("user_id", user.id),
  ]);

  const b = (budget.data ?? []).filter((r) => !r.pending); // previstos não contam
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
  const goalsSaved = [...savedByGoal.values()].reduce((s, v) => s + v, 0);
  const goalsTarget = goalsList.reduce((s, g) => s + Number(g.target_amount), 0);

  const dashSel = profile.dashboard_cards ?? ["reserva", "metas"];
  const CARD_VALUE: Record<string, { label: string; value: string; hint?: string }> = {
    patrimonio: { label: "Patrimônio líquido", value: formatCurrency(nw.netWorth, cur) },
    investido: {
      label: "Investido na carteira",
      value: formatCurrency(nw.wallet, cur),
      hint: nw.wallet === 0 ? "nada lançado ainda" : undefined,
    },
    reserva: {
      label: "Reserva de emergência",
      value: formatCurrency(reserveSaved, cur),
      hint: reserveTarget > 0 ? `${Math.round(reservePct)}% de ${formatCurrency(reserveTarget, cur)}` : undefined,
    },
    metas: {
      label: "Guardado em metas",
      value: formatCurrency(goalsSaved, cur),
      hint: goalsTarget > 0 ? `de ${formatCurrency(goalsTarget, cur)}` : undefined,
    },
    bens: { label: "Valor dos bens", value: formatCurrency(nw.assets, cur) },
    dividas: { label: "Dívidas", value: formatCurrency(nw.debts, cur) },
  };
  const dashCards = dashSel.map((id) => CARD_VALUE[id]).filter(Boolean).slice(0, 4);

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
    { href: "/app/orcamento?new=variable", label: "Lançar gasto", icon: ArrowLeftRight, tint: "bg-amber-50 text-amber-700" },
    { href: "/app/orcamento?new=income", label: "Lançar receita", icon: Wallet, tint: "bg-emerald-50 text-emerald-700" },
    { href: "/app/metas", label: "Aporte em meta", icon: Target, tint: "bg-sky-50 text-sky-700" },
    { href: "/app/investimentos", label: "Carteira", icon: TrendingUp, tint: "bg-brand-50 text-brand-700" },
    { href: "/app/patrimonio", label: "Patrimônio", icon: Landmark, tint: "bg-violet-50 text-violet-700" },
    { href: "/app/calculadoras", label: "Calculadoras", icon: Calculator, tint: "bg-ink/[0.05] text-ink" },
  ];

  const setup = [
    { href: "/app/orcamento?new=income", label: "Lance sua renda e as despesas do mês", done: (budget.data ?? []).length > 0 },
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

      <div className="grid gap-4 lg:grid-cols-2">
        {/* como foi o mês */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Como foi {monthName}
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink">
            {monthBalance < 0 ? (
              <>
                Você gastou{" "}
                <strong className="text-danger">
                  {formatCurrency(Math.abs(monthBalance), cur)}
                </strong>{" "}
                a mais do que ganhou este mês.
              </>
            ) : monthBalance > 0 ? (
              <>
                Sobraram{" "}
                <strong className="text-success">{formatCurrency(monthBalance, cur)}</strong>{" "}
                depois de pagar as contas do mês.
              </>
            ) : (
              <>Você ainda não lançou receitas ou despesas de {monthName}.</>
            )}
          </p>
          <Link
            href="/app/orcamento"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent-dim hover:underline"
          >
            Abrir o orçamento <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* o que você tem */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            O que você tem hoje
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink">
            Seu patrimônio líquido é{" "}
            <strong>{formatCurrency(nw.netWorth, cur)}</strong>: os seus bens
            ({formatCurrency(nw.assets, cur)})
            {nw.wallet > 0 ? ` mais investimentos (${formatCurrency(nw.wallet, cur)})` : ""}
            {nw.reserve > 0 ? ` mais reserva (${formatCurrency(nw.reserve, cur)})` : ""}
            {nw.debts > 0 ? `, menos as dívidas (${formatCurrency(nw.debts, cur)})` : ""}.
          </p>
          {nw.wallet === 0 && (
            <p className="mt-2 text-sm text-muted">
              Você ainda não lançou nenhum investimento.
            </p>
          )}
          <Link
            href="/app/patrimonio"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent-dim hover:underline"
          >
            Abrir o patrimônio <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-ink">Acompanhando</h2>
          <CustomizeDash selected={dashSel} />
        </div>
        {dashCards.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dashCards.map((c) => (
              <StatTile key={c.label} label={c.label} value={c.value} hint={c.hint} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Nenhum card escolhido. Toque em Personalizar para adicionar.
          </p>
        )}
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
          <h3 className="font-display text-base font-bold text-ink">Acesso rápido</h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {shortcuts.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-border p-3 text-center transition-colors hover:border-brand/40"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.tint}`}>
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-ink">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-base font-bold text-ink">Mercado hoje</h2>
        <p className="mt-0.5 text-xs text-muted">
          Índices de referência do país — não são seus valores. Atualizados hoje.
        </p>
        <div className="mt-3">
          <IndicadoresPanel data={indicators} />
        </div>
      </div>
    </>
  );
}
