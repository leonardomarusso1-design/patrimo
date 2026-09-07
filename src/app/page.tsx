import Link from "next/link";
import {
  ArrowRight,
  Wallet,
  ShieldCheck,
  Target,
  TrendingUp,
  Landmark,
  GraduationCap,
  Calculator,
  Globe,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { HeroPulse } from "@/components/marketing/HeroPulse";
import { PricingTable } from "@/components/marketing/PricingTable";
import { ButtonLink } from "@/components/ui/Button";
import { LESSONS } from "@/lib/school";
import { BLOG_POSTS } from "@/content/blog";

const MODULES = [
  { icon: Wallet, name: "Orçamento", desc: "Receita, despesa fixa e variável com categorias e gráfico. Importe o extrato e pare de digitar." },
  { icon: ShieldCheck, name: "Reserva de emergência", desc: "Descobre seu custo essencial e mostra o alvo: 6 meses (básico) ou 12 (blindado)." },
  { icon: Target, name: "Metas", desc: "Viagem, carro, entrada do apê. Registre aportes e veja quanto guardar por mês." },
  { icon: TrendingUp, name: "Investimentos", desc: "Carteira com valor atual, rendimento e composição por ativo e por classe." },
  { icon: Landmark, name: "Patrimônio", desc: "Liquidez, investimentos, bens e dívidas somados. Veículo puxa valor da tabela FIPE." },
  { icon: GraduationCap, name: "Escola", desc: "13 aulas do zero à independência financeira. Uma por vez, sem enrolação." },
  { icon: Calculator, name: "Calculadoras", desc: "Juros compostos, independência financeira, quitação de dívida, 50-30-20." },
  { icon: Globe, name: "Multi-moeda", desc: "Mora fora? Veja tudo em BRL, USD, EUR e mais — com câmbio aplicado de verdade." },
];

const DIFERENCIAIS = [
  { icon: Globe, title: "Multi-moeda real", text: "Não é só trocar o símbolo. O câmbio entra no consolidado — pra quem ganha numa moeda e gasta em outra." },
  { icon: Sparkles, title: "IA de investimentos", text: "No Elite, a IA lê o mercado todo dia e, pelo seu perfil de investidor, sugere onde aportar. Você decide." },
  { icon: TrendingUp, title: "Open Finance", text: "No Elite, conecte suas contas e as transações entram categorizadas. Menos digitação, mais decisão." },
];

const COMPARISON = [
  "Tudo numa tela (orçamento a patrimônio)",
  "Reserva e metas com acompanhamento visual",
  "Multi-moeda com câmbio aplicado",
  "IA sugerindo aportes pelo seu perfil",
  "Open Finance (transações automáticas)",
  "Funciona no celular sem quebrar fórmula",
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <HeroPulse />
          <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
            <p className="animate-fade-up text-sm font-semibold uppercase tracking-widest text-accent-dim">
              Controle financeiro pessoal
            </p>
            <h1 className="animate-fade-up mt-4 text-4xl font-extrabold leading-[1.05] text-ink sm:text-6xl">
              Seu dinheiro inteiro, <span className="text-gradient">numa tela só</span>.
            </h1>
            <p className="animate-fade-up mx-auto mt-6 max-w-xl text-lg text-muted">
              Orçamento, reserva, metas, investimentos e patrimônio no mesmo lugar.
              Com IA que lê o mercado todo dia e indica seus aportes.
            </p>
            <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/cadastro" size="lg" className="shadow-[var(--shadow-glow)]">
                Criar minha conta <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/precos" size="lg" variant="secondary">
                Ver planos
              </ButtonLink>
            </div>
            <p className="animate-fade-up mt-5 text-sm text-muted">
              A partir de R$ 49/mês · Pix, boleto ou cartão · cancele quando quiser
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <p className="text-center font-display text-2xl font-bold leading-snug text-ink sm:text-3xl">
            Você tem uma planilha, o app do banco, um caderninho e um grupo de
            investimento no WhatsApp. E, no fim do mês, o dinheiro sumiu sem você
            saber pra onde.
          </p>
          <p className="mt-5 text-center text-muted">
            O problema não é falta de disciplina. É que a informação está espalhada.
            O Patrimo junta tudo — e transforma número solto em decisão.
          </p>
        </section>

        <section id="funcionalidades" className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
              8 módulos. Uma assinatura.
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Cada peça do seu dinheiro tem um lugar — e todas conversam entre si.
            </p>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MODULES.map((m) => (
                <div
                  key={m.name}
                  className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
                >
                  <m.icon className="h-6 w-6 text-accent" />
                  <h3 className="mt-4 font-display text-base font-bold text-ink">{m.name}</h3>
                  <p className="mt-1.5 text-sm text-muted">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
            O que a planilha nunca vai fazer
          </h2>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {DIFERENCIAIS.map((d) => (
              <div key={d.title} className="rounded-2xl border border-border bg-card p-6">
                <d.icon className="h-6 w-6 text-violet" />
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{d.title}</h3>
                <p className="mt-2 text-sm text-muted">{d.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
              Patrimo vs. a planilha de sempre
            </h2>
            <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="grid grid-cols-[1fr_4rem_4rem] items-center gap-3 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                <span>Recurso</span>
                <span className="text-center">Planilha</span>
                <span className="text-center">Patrimo</span>
              </div>
              {COMPARISON.map((feature) => (
                <div
                  key={feature}
                  className="grid grid-cols-[1fr_4rem_4rem] items-center gap-3 border-b border-border px-5 py-3.5 text-sm last:border-0"
                >
                  <span className="text-ink/90">{feature}</span>
                  <span className="flex justify-center">
                    <X className="h-4 w-4 text-muted" />
                  </span>
                  <span className="flex justify-center">
                    <Check className="h-4 w-4 text-success" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="precos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
              Escolha o quanto de piloto automático você quer
            </h2>
            <p className="mt-3 text-muted">Sem plano grátis. Sem pegadinha. Cancele quando quiser.</p>
          </div>
          <PricingTable />
        </section>

        <section id="escola" className="bg-ink py-20 text-[#f7f5f1]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Escola Patrimo — {LESSONS.length} aulas do zero à independência
            </h2>
            <p className="mt-3 max-w-xl text-[#f7f5f1]/70">
              Do &ldquo;pra onde foi meu salário&rdquo; até &ldquo;quando posso parar de
              trabalhar&rdquo;. Uma aula por vez.
            </p>
            <div className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {LESSONS.map((l) => (
                <div
                  key={l.id}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <span className="font-display text-sm font-bold text-accent">
                    {String(l.id).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{l.title}</p>
                    <p className="text-xs text-[#f7f5f1]/55">{l.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Do blog</h2>
            <Link href="/blog" className="text-sm font-semibold text-accent-dim hover:underline">
              Ver tudo
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {BLOG_POSTS.slice(0, 3).map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-ink/25"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-accent-dim">
                  {p.tags[0]}
                </p>
                <h3 className="mt-2 font-display text-base font-bold text-ink">{p.title}</h3>
                <p className="mt-2 text-sm text-muted">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-8 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
            Comece hoje. Seu eu de daqui a um ano agradece.
          </h2>
          <div className="mt-8">
            <ButtonLink href="/cadastro" size="lg" className="shadow-[var(--shadow-glow)]">
              Criar minha conta <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
