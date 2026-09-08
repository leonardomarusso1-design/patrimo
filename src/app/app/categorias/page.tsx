import { requireUser } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { CategoriasUI } from "./ui";
import type { Tables } from "@/types/database";

export const metadata = { title: "Categorias" };

export default async function CategoriasPage() {
  const { user, supabase } = await requireUser();
  const { data } = await supabase
    .from("budget_categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  const cats = (data ?? []) as Tables<"budget_categories">[];
  const expense = cats.filter((c) => c.kind !== "income");
  const income = cats.filter((c) => c.kind === "income");

  return (
    <>
      <PageHeader
        title="Categorias"
        subtitle="Crie, renomeie e escolha a cor de cada categoria. Arquive as que não usa mais."
      />
      <CategoriasUI expense={expense} income={income} />
    </>
  );
}
