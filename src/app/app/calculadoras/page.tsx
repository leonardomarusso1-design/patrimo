import { requirePlan } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { getRates } from "@/lib/fx";
import { getCdiAnnual, getCryptoPrices } from "@/lib/market";
import { Calculadoras } from "./ui";

export const metadata = { title: "Calculadoras" };
export const dynamic = "force-dynamic";

export default async function CalculadorasPage() {
  await requirePlan("pro", "Calculadoras");
  const [rates, cdiAnnual, crypto] = await Promise.all([
    getRates(),
    getCdiAnnual(),
    getCryptoPrices(),
  ]);
  return (
    <>
      <PageHeader
        title="Calculadoras"
        subtitle="Simule antes de decidir. Nada é salvo — brinque à vontade."
      />
      <Calculadoras rates={rates} cdiAnnual={cdiAnnual} crypto={crypto} />
    </>
  );
}
