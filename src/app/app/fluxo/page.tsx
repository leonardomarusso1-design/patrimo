import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { FluxoView } from "./FluxoView";

export const metadata = { title: "Fluxo de caixa" };

export default async function FluxoPage() {
  const [{ user, supabase }, profile] = await Promise.all([requireUser(), getProfile()]);

  const from = new Date();
  from.setMonth(from.getMonth() - 4);
  const fromMonth = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}-01`;

  const { data } = await supabase
    .from("budget_entries")
    .select("name, amount, kind, entry_date, reference_month, pending, recurring, due_day")
    .eq("user_id", user.id)
    .gte("reference_month", fromMonth);

  return (
    <>
      <PageHeader
        title="Fluxo de caixa"
        subtitle="O que já aconteceu e o que está por vir — junta lançamentos confirmados, previstos e recorrências."
      />
      <FluxoView entries={data ?? []} currency={profile.display_currency} />
    </>
  );
}
