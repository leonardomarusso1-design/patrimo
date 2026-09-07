import { Target } from "lucide-react";
import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { AddButton, type Field } from "@/components/app/EntityManager";
import { Progress, EmptyState } from "@/components/ui/Misc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { requiredMonthlyContribution } from "@/lib/finance";
import { deleteRow } from "@/app/app/actions";
import type { Tables } from "@/types/database";

export const metadata = { title: "Metas" };

type Goal = Tables<"goals">;
type Contribution = Tables<"goal_contributions">;

const GOAL_FIELDS: Field[] = [
  { name: "name", label: "Nome da meta", type: "text", required: true, placeholder: "Viagem, entrada do apê, carro…" },
  { name: "target_amount", label: "Valor total (R$)", type: "money", required: true },
  { name: "deadline", label: "Prazo (opcional)", type: "date" },
  { name: "where_to_keep", label: "Onde vai guardar (opcional)", type: "text", placeholder: "Tesouro Selic, CDB, Caixinha…" },
];

export default async function MetasPage() {
  const [{ user, supabase }, profile] = await Promise.all([requireUser(), getProfile()]);
  const cur = profile.display_currency;

  const [{ data: goalsData }, { data: contribData }] = await Promise.all([
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("archived", false)
      .order("created_at", { ascending: false }),
    supabase.from("goal_contributions").select("*").eq("user_id", user.id),
  ]);

  const now = new Date();
  const nowMs = now.getTime();
  const today = now.toISOString().slice(0, 10);
  const goals = (goalsData ?? []) as Goal[];
  const contributions = (contribData ?? []) as Contribution[];
  const savedByGoal = new Map<string, number>();
  for (const c of contributions) {
    savedByGoal.set(c.goal_id, (savedByGoal.get(c.goal_id) ?? 0) + Number(c.amount));
  }

  return (
    <>
      <PageHeader
        title="Metas"
        subtitle="Qual é o seu próximo sonho? Registre aportes e acompanhe até chegar lá."
        action={
          goals.length > 0 ? (
            <AddButton
              table="goals"
              path="/app/metas"
              fields={GOAL_FIELDS}
              label="Nova meta"
              title="Nova meta"
            />
          ) : undefined
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          icon={<Target className="h-8 w-8" />}
          title="Qual é o seu próximo sonho?"
          description="Uma viagem, um carro, a entrada do apartamento. Crie uma meta, registre seus aportes e acompanhe o progresso."
          action={
            <AddButton
              table="goals"
              path="/app/metas"
              fields={GOAL_FIELDS}
              label="Criar minha primeira meta"
              title="Nova meta"
            />
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => {
            const saved = savedByGoal.get(goal.id) ?? 0;
            const target = Number(goal.target_amount);
            const pct = target > 0 ? (saved / target) * 100 : 0;
            const missing = Math.max(target - saved, 0);
            let monthlyHint: string | null = null;
            if (goal.deadline && missing > 0) {
              const months = Math.max(
                Math.round(
                  (new Date(goal.deadline).getTime() - nowMs) /
                    (1000 * 60 * 60 * 24 * 30),
                ),
                1,
              );
              const need = requiredMonthlyContribution({
                target,
                current: saved,
                annualRatePct: 10,
                months,
              });
              monthlyHint = `Guarde ${formatCurrency(need, cur)}/mês para chegar lá`;
            }

            return (
              <div
                key={goal.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-base font-bold text-ink">{goal.name}</p>
                    <p className="text-xs text-muted">
                      {goal.where_to_keep ? `${goal.where_to_keep} · ` : ""}
                      {goal.deadline ? formatDate(goal.deadline) : "sem prazo"}
                    </p>
                  </div>
                  <form action={deleteRow}>
                    <input type="hidden" name="_table" value="goals" />
                    <input type="hidden" name="_path" value="/app/metas" />
                    <input type="hidden" name="_id" value={goal.id} />
                    <button className="text-xs text-muted hover:text-danger">excluir</button>
                  </form>
                </div>

                <p className="money mt-3 font-display text-2xl font-extrabold text-ink">
                  {formatCurrency(saved, cur)}
                  <span className="text-sm font-semibold text-muted">
                    {" "}
                    de {formatCurrency(target, cur)}
                  </span>
                </p>
                <div className="mt-2">
                  <Progress value={pct} tone={pct >= 100 ? "success" : "accent"} />
                </div>
                <p className="mt-1.5 text-xs text-muted">
                  {pct >= 100
                    ? "Meta batida! 🎯"
                    : `${Math.round(pct)}% · faltam ${formatCurrency(missing, cur)}`}
                </p>
                {monthlyHint && (
                  <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs text-ink/80">
                    {monthlyHint}
                  </p>
                )}

                <div className="mt-4">
                  <AddButton
                    table="goal_contributions"
                    path="/app/metas"
                    hidden={{ goal_id: goal.id }}
                    fields={[
                      { name: "amount", label: "Valor do aporte (R$)", type: "number", required: true, step: "0.01" },
                      { name: "contributed_on", label: "Data", type: "date", required: true, defaultValue: today },
                    ]}
                    label="Aportar"
                    fullWidth
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
