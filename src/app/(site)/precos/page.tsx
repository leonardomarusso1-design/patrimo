import { pageMetadata } from "@/lib/seo";
import { PricingTable } from "@/components/marketing/PricingTable";

export const metadata = pageMetadata({
  title: "Preços",
  description:
    "Um plano só: R$ 97,90 por ano, em até 12x no cartão. Tudo incluído, sem mensalidade recorrente.",
  path: "/precos",
});

const FAQ = [
  {
    q: "Como funciona o teste grátis?",
    a: "7 dias com tudo liberado, sem pedir cartão. No fim do período, se você não assinar, o acesso pausa — seus dados ficam salvos e voltam quando você assinar.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "R$ 97,90 pelo ano inteiro. Você paga à vista (Pix ou boleto) ou parcela em até 12x no cartão — cada parcela fica em torno de R$ 8,16. A cobrança é feita pela Kiwify.",
  },
  {
    q: "É assinatura que renova sozinha?",
    a: "O acesso vale 1 ano. Perto do vencimento você recebe um aviso para renovar. Nada é cobrado automaticamente sem você confirmar.",
  },
  {
    q: "Posso pedir reembolso?",
    a: "Sim. Compras feitas online têm 7 dias de arrependimento pelo Código de Defesa do Consumidor. É só falar com o suporte.",
  },
  {
    q: "A IA de investimentos dá recomendação de compra?",
    a: "Ela vai sugerir direções com base no seu perfil e na leitura do mercado. A decisão final é sempre sua — não é consultoria de investimento registrada. Esse recurso entra em breve.",
  },
];

export default function PrecosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-ink sm:text-5xl">
          Um plano. Tudo incluído.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          R$ 97,90 pelo ano inteiro, ou 12x de R$ 8,16 no cartão. Orçamento,
          reserva, metas, investimentos, patrimônio e academia — tudo liberado.
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
