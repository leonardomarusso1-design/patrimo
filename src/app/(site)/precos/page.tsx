import { pageMetadata } from "@/lib/seo";
import { PricingTable } from "@/components/marketing/PricingTable";

export const metadata = pageMetadata({
  title: "Preços",
  description:
    "Três planos: Essencial, Pro e Elite. Sem plano grátis, sem pegadinha. A partir de R$ 49/mês.",
  path: "/precos",
});

const FAQ = [
  {
    q: "Por que não tem plano grátis?",
    a: "Menos de 3% dos usuários grátis convertem, e eles puxam o roadmap para o lado errado. Preferimos cobrar um valor justo e entregar um produto que vale a pena.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. O cancelamento vale para o próximo ciclo e você mantém acesso até o fim do período já pago. Seus dados continuam seus.",
  },
  {
    q: "Qual a diferença entre mensal e anual?",
    a: "No plano anual você paga o equivalente a 10 meses — 2 meses saem de graça.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Pix, boleto ou cartão pela Kiwify. A ativação do plano é automática após a confirmação.",
  },
  {
    q: "A IA de investimentos dá recomendação de compra?",
    a: "Ela sugere direções com base no seu perfil e na leitura do mercado. A decisão final é sempre sua — não é consultoria de investimento registrada.",
  },
];

export default function PrecosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-ink sm:text-5xl">
          Um preço para cada nível de piloto automático
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Comece organizando o mês. Suba para investir melhor. Chegue no Elite e deixe
          a IA trabalhar por você.
        </p>
      </div>

      <div className="mt-14">
        <PricingTable />
      </div>

      <section className="mx-auto mt-24 max-w-2xl">
        <h2 className="text-2xl font-extrabold text-ink">Perguntas frequentes</h2>
        <div className="mt-8 divide-y divide-border">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="cursor-pointer list-none font-display text-base font-bold text-ink">
                {item.q}
              </summary>
              <p className="mt-2 text-sm text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
