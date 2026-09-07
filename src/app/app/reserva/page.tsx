import { ShieldCheck } from "lucide-react";
import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { EntityManager } from "@/components/app/EntityManager";
import { Progress, StatTile } from "@/components/ui/Misc";
import { formatCurrency } from "@/lib/utils";
import { emergencyTarget } from "@/lib/finance";
import { EditFund } from "./EditFund";
import type { Tables } from "@/types/database";

export const metadata = { title: "Reserva de emergência" };

type Reserve = Tables<"emergency_reserves">;

export default async function ReservaPage() {
  const [{ user, supabase }, profile] = await Promise.all([requireUser(), getProfile()]);

  const [{ data: fund }, { data: reserves }] = await Promise.all([
    supabase.from("emergency_fund").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("emergency_reserves")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  const level = (fund?.protection_level ?? "basic") as "basic" | "shield";
  const cost = Number(fund?.essential_monthly_cost ?? 0);
  const target = emergencyTarget(cost, level);
  const rows = (reserves ?? []) as Reserve[];
  const saved = rows.reduce((s, r) => s + Number(r.amount), 0);
  const pct = target > 0 ? (saved / target) * 100 : 0;
  const cur = profile.display_currency;

  return (
    <>
      <PageHeader
        title="Reserva de emergência"
        subtitle="O colchão que te deixa dormir tranquilo."
        action={<EditFund level={level} cost={cost} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)]">
          <ShieldCheck
            className={`mx-auto h-14 w-14 ${pct >= 100 ? "text-success" : "text-accent"}`}
          />
          <p className="mt-4 font-display text-xl font-extrabold text-ink">
            {pct >= 100
              ? "Reserva completa. Respira fundo."
              : `Você está ${Math.round(pct)}% protegido`}
          </p>
          <div className="mx-auto mt-4 max-w-xs">
            <Progress value={pct} tone={pct >= 100 ? "success" : "accent"} />
          </div>
          <p className="mt-2 text-sm text-muted">
            {formatCurrency(saved, cur)} de {formatCurrency(target, cur)}
          </p>
        </div>

        <div className="space-y-4">
          <StatTile
            label={`Sua reserva deve ser de (${level === "shield" ? "12" : "6"} meses)`}
            value={formatCurrency(target, cur)}
            hint={cost > 0 ? `custo essencial: ${formatCurrency(cost, cur)}/mês` : "Defina seu custo essencial em Editar"}
          />
          <StatTile label="Reserva atual" value={formatCurrency(saved, cur)} tone="ink" />
        </div>
      </div>

      <div className="mt-6">
        <EntityManager<Reserve>
          table="emergency_reserves"
          path="/app/reserva"
          title="Onde está sua reserva"
          addLabel="Adicionar aplicação"
          fields={[
            { name: "label", label: "Aplicação", type: "text", required: true, placeholder: "Tesouro Selic, CDB liquidez diária…" },
            { name: "amount", label: "Valor (R$)", type: "money", required: true },
          ]}
          rows={rows}
          columns={[
            { header: "Aplicação", cell: (r) => <span className="font-medium text-ink">{r.label}</span> },
            {
              header: "Valor",
              cell: (r) => <span className="tabular-nums text-ink">{formatCurrency(Number(r.amount), cur)}</span>,
              className: "sm:text-right",
            },
          ]}
          emptyTitle="Nenhuma aplicação registrada"
          emptyDescription="Some aqui o que está em Tesouro Selic, CDB de liquidez diária, fundos DI."
        />
      </div>
    </>
  );
}
