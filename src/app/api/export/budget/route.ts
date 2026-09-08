import { requireUser } from "@/lib/data";
import { safeError } from "@/lib/logger";

const KIND: Record<string, string> = {
  income: "Receita",
  expense_fixed: "Despesa fixa",
  expense_variable: "Despesa variável",
};

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV dos lançamentos de um mês. ?m=YYYY-MM */
export async function GET(req: Request) {
  const m = new URL(req.url).searchParams.get("m") ?? "";
  if (!/^\d{4}-\d{2}$/.test(m)) {
    return new Response("mês inválido", { status: 400 });
  }
  try {
    const { user, supabase } = await requireUser();
    const { data, error } = await supabase
      .from("budget_entries")
      .select("entry_date, kind, name, category, amount, pending, recurring")
      .eq("user_id", user.id)
      .eq("reference_month", `${m}-01`)
      .order("entry_date", { ascending: true, nullsFirst: false });
    if (error) return new Response(safeError("export.budget", error), { status: 500 });

    const header = ["Data", "Tipo", "Nome", "Categoria", "Valor", "Pago", "Recorrente"];
    const lines = (data ?? []).map((r) =>
      [
        r.entry_date ?? "",
        KIND[r.kind] ?? r.kind,
        r.name,
        r.category ?? "",
        Number(r.amount).toFixed(2).replace(".", ","),
        r.pending ? "Não" : "Sim",
        r.recurring ? "Sim" : "Não",
      ]
        .map(csvCell)
        .join(";"),
    );
    const body = "﻿" + [header.join(";"), ...lines].join("\r\n");

    return new Response(body, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="ordre-orcamento-${m}.csv"`,
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    return new Response(safeError("export.budget", err), { status: 500 });
  }
}
