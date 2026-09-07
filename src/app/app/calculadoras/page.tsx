import { requirePlan } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { Calculadoras } from "./ui";

export const metadata = { title: "Calculadoras" };

export default async function CalculadorasPage() {
  await requirePlan("pro", "Calculadoras");
  return (
    <>
      <PageHeader
        title="Calculadoras"
        subtitle="Simule antes de decidir. Nada é salvo — brinque à vontade."
      />
      <Calculadoras />
    </>
  );
}
