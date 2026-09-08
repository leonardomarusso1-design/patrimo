import { pageMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = pageMetadata({
  title: "Programa de parceria",
  description:
    "Influenciadores de finanças ganham 50% de comissão por cada assinatura anual do Ordre. Seguidor entra com 5% de desconto.",
  path: "/parceria",
});

const KIWIFY_JOIN = "https://dashboard.kiwify.com/join/affiliate/GLTuKOpQ";

const STEPS = [
  {
    n: "1",
    t: "Você se inscreve",
    d: "Preenche o cadastro de afiliado e informa seu Instagram e o número de seguidores.",
  },
  {
    n: "2",
    t: "A gente aprova",
    d: "Analisamos seu perfil. Aceitamos criadores com mais de 5 mil seguidores no Instagram e conteúdo ligado a finanças, investimentos ou organização pessoal.",
  },
  {
    n: "3",
    t: "Você indica e ganha",
    d: "Recebe um link exclusivo e o cupom 5PORCENTO. Cada pessoa que assinar pelo seu link gera comissão — a Kiwify rastreia e paga automaticamente.",
  },
];

export default function ParceriaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
        Programa de parceria
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
        Indique o Ordre e ganhe 50% por assinatura
      </h1>
      <p className="mt-4 text-muted">
        Para criadores de conteúdo de finanças. Você recomenda a ferramenta que usa,
        seu público entra com desconto e você é remunerado por cada assinatura.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-2xl font-extrabold text-ink">R$ 43,30</p>
          <p className="mt-1 text-sm text-muted">sua comissão por assinatura anual</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-2xl font-extrabold text-ink">5%</p>
          <p className="mt-1 text-sm text-muted">de desconto pro seu seguidor (cupom 5PORCENTO)</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-2xl font-extrabold text-ink">30 dias</p>
          <p className="mt-1 text-sm text-muted">de cookie: a venda conta mesmo se a pessoa voltar depois</p>
        </div>
      </div>

      <h2 className="mt-14 font-display text-xl font-bold text-ink">Como funciona</h2>
      <ol className="mt-6 space-y-5">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 font-display text-sm font-bold text-brand-700">
              {s.n}
            </span>
            <div>
              <p className="font-display font-bold text-ink">{s.t}</p>
              <p className="mt-1 text-sm text-muted">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-2xl border border-brand/30 bg-brand-50 p-6">
        <p className="font-display text-lg font-bold text-brand-700">Quero ser parceiro</p>
        <p className="mt-1 text-sm text-brand-700/80">
          O cadastro e o pagamento são feitos pela Kiwify. Leva 2 minutos.
        </p>
        <ButtonLink href={KIWIFY_JOIN} className="mt-4">
          Fazer meu cadastro de afiliado
        </ButtonLink>
      </div>

      <p className="mt-8 text-xs text-muted">
        Comissão paga pela Kiwify conforme as regras da plataforma (após a taxa de
        processamento). Solicitações fora do critério de seguidores ou de nicho podem
        ser recusadas. Dúvidas: leonardomarusso1@gmail.com
      </p>
    </div>
  );
}
