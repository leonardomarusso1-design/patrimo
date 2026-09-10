import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, CircleDollarSign, Landmark, LockKeyhole, PiggyBank, ShieldCheck, Sparkles, Target, TrendingUp, Upload } from "lucide-react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SupportWidget } from "@/components/marketing/SupportWidget";
import { AppPreview } from "@/components/marketing/AppPreview";
import { InteractiveDemo, ComingSoonPill } from "@/components/marketing/InteractiveDemo";
import { BlogCover } from "@/components/BlogCover";
import { PricingTable } from "@/components/marketing/PricingTable";
import { ButtonLink } from "@/components/ui/Button";
import { BLOG_POSTS } from "@/content/blog";

const MODULES = [
  { icon: CircleDollarSign, name: "Orçamento que conversa", desc: "Veja para onde o mês está indo e o que sobra para as decisões que importam." },
  { icon: ShieldCheck, name: "Reserva protegida", desc: "Um alvo claro de 6 ou 12 meses, com progresso visual e próxima ação." },
  { icon: Target, name: "Metas com contexto", desc: "Cada aporte mostra quanto falta e como a meta muda seu patrimônio." },
  { icon: TrendingUp, name: "Investimentos sem ruído", desc: "Composição, rendimento e perfil em uma visão simples e explicável." },
  { icon: Landmark, name: "Patrimônio líquido", desc: "Bens, dívidas, investimentos e liquidez no mesmo lugar — de verdade." },
  { icon: PiggyBank, name: "Decisões do mês", desc: "Resumo, alertas e uma única próxima ação para você não se perder." },
];

const STEPS = [
  { number: "01", title: "Organize", text: "Comece com renda, gastos e uma meta. Importe seu CSV ou lance manualmente." },
  { number: "02", title: "Proteja", text: "Descubra seu custo essencial, monte a reserva e acompanhe os aportes." },
  { number: "03", title: "Construa", text: "Conecte cada decisão ao patrimônio líquido e veja o progresso no tempo." },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-border/60 bg-[#f8faf7]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(177,220,80,0.22),transparent_28%),radial-gradient(circle_at_20%_70%,rgba(11,122,85,0.08),transparent_32%)]" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-4 lg:pt-24">
            <div className="max-w-xl">
              <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white/80 px-3 py-1.5 text-xs font-bold text-brand-700 shadow-sm"><span className="h-2 w-2 rounded-full bg-brand" /> Seu dinheiro, com direção</div>
              <h1 className="animate-fade-up mt-6 text-5xl font-extrabold leading-[0.98] tracking-[-0.05em] text-ink sm:text-7xl">Organize o mês.<br /><span className="text-gradient">Construa o patrimônio.</span></h1>
              <p className="animate-fade-up mt-6 max-w-lg text-lg leading-8 text-muted">O Ordre transforma gastos, reserva, metas e investimentos em uma visão simples para você decidir melhor — hoje e no futuro.</p>
              <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/cadastro" size="lg" className="shadow-[var(--shadow-glow)]">Começar meu diagnóstico <ArrowRight className="h-4 w-4" /></ButtonLink><ButtonLink href="#como-funciona" size="lg" variant="secondary">Ver como funciona</ButtonLink></div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted"><span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> 7 dias grátis</span><span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> Sem cartão</span><span className="inline-flex items-center gap-1.5"><LockKeyhole className="h-3.5 w-3.5 text-brand" /> Dados protegidos</span></div>
            </div>
            <div className="relative min-h-[360px] sm:min-h-[480px] lg:min-h-[560px]"><Image src="/marketing/patrimo-hero.png" alt="Pessoa avançando por uma jornada de decisões financeiras" fill priority className="object-contain object-center lg:object-right" sizes="(max-width: 1024px) 100vw, 55vw" /><div className="absolute bottom-2 left-2 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xl backdrop-blur sm:bottom-10 sm:left-5"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Próxima ação</p><p className="mt-1 text-sm font-extrabold text-ink">Reforce sua reserva em R$ 420</p><p className="mt-1 text-xs text-brand-700">Você está a 78% do alvo</p></div></div>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-6 max-w-6xl px-4 sm:px-6"><AppPreview /></section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28" id="como-funciona">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-center"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Do descontrole à clareza</p><h2 className="mt-4 max-w-lg text-4xl font-extrabold leading-tight text-ink sm:text-5xl">Uma sequência que faz sentido para a vida real.</h2><p className="mt-5 max-w-md text-base leading-7 text-muted">Você não precisa virar especialista em finanças. Precisa saber qual é a próxima decisão — e por que ela importa.</p><Link href="/cadastro" className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-brand-700 hover:gap-3">Começar agora <ArrowRight className="h-4 w-4" /></Link></div><div className="grid gap-3 sm:grid-cols-3">{STEPS.map((step) => <div key={step.number} className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"><span className="font-display text-sm font-extrabold text-brand">{step.number}</span><h3 className="mt-12 text-xl font-extrabold text-ink">{step.title}</h3><p className="mt-3 text-sm leading-6 text-muted">{step.text}</p></div>)}</div></div>
        </section>

        <section className="bg-ink py-20 text-[#eaf5ee] sm:py-28"><div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">O que muda</p><h2 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">Menos abas. Mais decisões que você consegue explicar.</h2><p className="mt-5 max-w-lg leading-7 text-[#eaf5ee]/65">O Ordre junta o presente e o futuro no mesmo painel: o gasto de hoje, a meta de amanhã e o patrimônio que você está construindo.</p><div className="mt-8 space-y-4">{["Uma visão de orçamento a patrimônio", "Metas e reserva com progresso visual", "IA que explica seus números — você decide", "Open Finance com transparência, em breve"].map((item, i) => <div key={item} className="flex items-center gap-3 text-sm font-semibold"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent">{i === 3 ? <Sparkles className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}</span>{item}{i === 3 && <ComingSoonPill />}</div>)}</div></div><div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-3"><Image src="/marketing/patrimo-journey.png" alt="Jornada visual do Ordre" width={2176} height={1632} className="h-auto w-full rounded-[1.5rem]" /></div></div></section>

        <section id="funcionalidades" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Tudo conectado</p><h2 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">Seu dinheiro em uma só história.</h2></div><p className="max-w-sm text-sm leading-6 text-muted">Cada módulo existe para responder uma pergunta concreta da sua vida financeira.</p></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{MODULES.map((module) => <div key={module.name} className="group rounded-3xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[var(--shadow-card)]"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><module.icon className="h-5 w-5" /></div><h3 className="mt-6 text-lg font-extrabold text-ink">{module.name}</h3><p className="mt-2 text-sm leading-6 text-muted">{module.desc}</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-brand-700 opacity-0 transition-opacity group-hover:opacity-100">Explorar módulo <ChevronRight className="h-3.5 w-3.5" /></span></div>)}</div></section>

        <section className="bg-surface py-20 sm:py-28"><div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:items-center"><InteractiveDemo /><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Experimente agora</p><h2 className="mt-4 text-4xl font-extrabold leading-tight text-ink sm:text-5xl">Antes de organizar tudo, entenda o que importa.</h2><p className="mt-5 leading-7 text-muted">O Ordre começa pela decisão, não pela planilha. Faça uma simulação e veja como uma pequena mudança mensal pode proteger sua reserva e acelerar uma meta.</p><div className="mt-8 rounded-2xl border border-border bg-card p-5"><div className="flex items-start gap-3"><Upload className="mt-0.5 h-5 w-5 text-brand" /><div><p className="font-bold text-ink">Importe seu extrato quando quiser</p><p className="mt-1 text-sm leading-6 text-muted">CSV brasileiro com prévia, categorias e edição. Open Finance fica marcado como <strong className="text-brand-700">em breve</strong>, sem prometer o que ainda não está pronto.</p></div></div></div></div></div></section>

        <section id="precos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28"><div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Comece sem pressão</p><h2 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">Clareza custa menos que continuar no escuro.</h2><p className="mt-4 leading-7 text-muted">7 dias para experimentar o método completo, sem cartão. Depois, um plano anual simples.</p></div><PricingTable /></section>

        <section id="academia" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:pb-28"><div className="rounded-[2rem] bg-brand-50 p-8 sm:p-12"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Aprenda fazendo</p><h2 className="mt-3 text-4xl font-extrabold text-ink">Academia Ordre</h2><p className="mt-4 max-w-xl leading-7 text-muted">Conteúdo direto para transformar cada módulo em uma decisão prática. Aulas, calculadoras e checklists para acompanhar o seu ritmo.</p></div><ButtonLink href="/app/escola" variant="secondary">Conhecer a Academia <ArrowRight className="h-4 w-4" /></ButtonLink></div></div></section>

        <section className="border-t border-border/70"><div className="mx-auto max-w-6xl px-4 py-20 sm:px-6"><div className="flex items-end justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Conteúdo</p><h2 className="mt-3 text-4xl font-extrabold text-ink">Para decidir melhor.</h2></div><Link href="/blog" className="hidden items-center gap-1 text-sm font-bold text-brand-700 sm:flex">Ver tudo <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-10 grid gap-6 md:grid-cols-3">{BLOG_POSTS.slice(0, 3).map((post) => <Link key={post.slug} href={`/blog/${post.slug}`} className="group"><BlogCover slug={post.slug} tag={post.tags[0]} className="h-40 rounded-2xl" /><h3 className="mt-4 text-lg font-extrabold text-ink group-hover:text-brand-700">{post.title}</h3><p className="mt-2 text-sm leading-6 text-muted">{post.excerpt}</p></Link>)}</div></div></section>

        <section className="mx-auto max-w-3xl px-4 pb-24 text-center sm:px-6"><div className="rounded-[2rem] bg-ink px-6 py-12 text-[#eaf5ee] sm:px-12"><h2 className="text-4xl font-extrabold sm:text-5xl">Seu próximo passo começa com clareza.</h2><p className="mx-auto mt-4 max-w-lg leading-7 text-[#eaf5ee]/65">Organize o presente. Proteja o futuro. Veja seu patrimônio evoluir.</p><ButtonLink href="/cadastro" size="lg" className="mt-8 bg-accent text-white hover:bg-accent-dim">Começar 7 dias grátis <ArrowRight className="h-4 w-4" /></ButtonLink></div></section>
      </main>
      <SiteFooter />
      <SupportWidget />
    </>
  );
}
