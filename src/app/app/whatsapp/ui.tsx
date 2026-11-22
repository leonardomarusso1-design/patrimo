"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import type { PanelData } from "@/lib/whatsapp/panel";
import {
  disconnectWhatsapp,
  generateWhatsappCode,
  purgeWhatsappHistory,
  updateWhatsappPrefs,
  type WaState,
} from "./actions";

const empty: WaState = {};

export function WhatsappPanel({ data }: { data: PanelData }) {
  const cap = data.quota + data.bonus;
  const usedPct = cap > 0 ? Math.min(100, Math.round((data.used / cap) * 100)) : 0;
  const atLimit = data.ready && data.used >= cap;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <ConnectCard data={data} />
        <PrefsCard data={data} />
        <HistoryCard linked={data.linked && data.ready} />
      </div>
      <div className="space-y-4">
        <QuotaCard data={data} cap={cap} usedPct={usedPct} atLimit={atLimit} />
        <p className="text-xs text-muted">
          O bot não pede senha, CPF nem cartão. Dúvida de investimento é educativa: explica o
          conceito e compara a sua carteira com o seu perfil, sem indicar compra ou venda de ativo.
        </p>
      </div>
    </div>
  );
}

function ConnectCard({ data }: { data: PanelData }) {
  const [state, action, pending] = useActionState(generateWhatsappCode, empty);
  const [off, disconnect, disconnecting] = useActionState(disconnectWhatsapp, empty);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <h2 className="font-display text-lg font-bold text-ink">Conectar número</h2>
      {!data.enabled && (
        <p className="mt-2 text-sm text-muted">
          O Ordre no WhatsApp está em preparação. Quando estiver no ar, você gera um código aqui e
          envia no chat para vincular o número.
        </p>
      )}
      {data.enabled && !data.ready && (
        <p className="mt-2 text-sm text-muted">
          A conexão ainda não está disponível nesta conta. Tente de novo em alguns minutos.
        </p>
      )}
      {data.enabled && data.ready && data.linked && (
        <p className="mt-2 text-sm text-ink">
          Número conectado: <span className="font-semibold">{data.maskedPhone ?? "••••"}</span>
        </p>
      )}
      {data.enabled && data.ready && !data.linked && (
        <>
          <p className="mt-2 text-sm text-muted">
            Gere um código e envie no WhatsApp do Ordre. Ele vale 15 minutos e prova que o número é
            seu. A mensagem abre a conversa; avisos automáticos ficam desligados até você optar.
          </p>
          <form action={action} className="mt-4">
            {state.error && <Note tone="danger">{state.error}</Note>}
            <Button type="submit" loading={pending}>
              Gerar código
            </Button>
          </form>
          {state.code && (
            <div className="mt-4 rounded-xl bg-surface px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Envie esta mensagem</p>
              <p className="mt-1 font-display text-2xl font-extrabold tracking-wide text-ink">{state.code}</p>
              {state.waUrl && (
                <a
                  href={state.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-accent-dim hover:underline"
                >
                  Abrir o WhatsApp com o código →
                </a>
              )}
            </div>
          )}
        </>
      )}

      {data.ready && data.linked && (
        <form action={disconnect} className="mt-4 space-y-3">
          {off.error && <Note tone="danger">{off.error}</Note>}
          {off.ok && <Note tone="ok">{off.ok}</Note>}
          <label className="flex items-start gap-3 text-sm text-ink">
            <input type="checkbox" name="confirm" className="mt-1 h-4 w-4" />
            Quero desconectar este número
          </label>
          <Button type="submit" variant="secondary" loading={disconnecting}>
            Desconectar
          </Button>
        </form>
      )}
    </section>
  );
}

function PrefsCard({ data }: { data: PanelData }) {
  const [state, action, pending] = useActionState(updateWhatsappPrefs, empty);
  const disabled = !data.enabled || !data.ready || !data.linked;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <h2 className="font-display text-lg font-bold text-ink">Avisos</h2>
      <p className="mt-2 text-sm text-muted">
        Resumo e lembrete de conta a pagar são opcionais e saem só se você ligar aqui. Dá para
        parar a qualquer momento mandando &quot;parar&quot; no chat.
      </p>
      <form action={action} className="mt-4 space-y-3">
        {state.error && <Note tone="danger">{state.error}</Note>}
        {state.ok && <Note tone="ok">{state.ok}</Note>}
        <Check name="alerts" label="Quero receber avisos no WhatsApp" defaultChecked={data.alerts} disabled={disabled} />
        <Check name="daily" label="Contas que vencem hoje e amanhã (8h)" defaultChecked={data.daily} disabled={disabled} />
        <Check name="weekly" label="Resumo da semana, toda segunda (8h)" defaultChecked={data.weekly} disabled={disabled} />
        <Check name="monthly" label="Fechamento do mês, no dia 1 (8h)" defaultChecked={data.monthly} disabled={disabled} />
        <Button type="submit" variant="secondary" loading={pending} disabled={disabled}>
          Salvar avisos
        </Button>
      </form>
    </section>
  );
}

function HistoryCard({ linked }: { linked: boolean }) {
  const [state, action, pending] = useActionState(purgeWhatsappHistory, empty);
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <h2 className="font-display text-lg font-bold text-ink">Histórico do bot</h2>
      <p className="mt-2 text-sm text-muted">
        Apaga o registro técnico das mensagens e as regras que o bot aprendeu com as suas correções.
        Os lançamentos do orçamento ficam. Fotos de comprovante não são armazenadas.
      </p>
      <form action={action} className="mt-4 space-y-3">
        {state.error && <Note tone="danger">{state.error}</Note>}
        {state.ok && <Note tone="ok">{state.ok}</Note>}
        <label className="flex items-start gap-3 text-sm text-ink">
          <input type="checkbox" name="confirm_purge" className="mt-1 h-4 w-4" disabled={!linked} />
          Apagar o histórico do bot desta conta
        </label>
        <Button type="submit" variant="danger" loading={pending} disabled={!linked}>
          Apagar histórico
        </Button>
      </form>
    </section>
  );
}

function QuotaCard({
  data,
  cap,
  usedPct,
  atLimit,
}: {
  data: PanelData;
  cap: number;
  usedPct: number;
  atLimit: boolean;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Cota do mês</p>
      <p className="mt-1 font-display text-xl font-extrabold text-ink">
        {data.used} de {cap}
      </p>
      <p className="text-xs text-muted">
        Ações no WhatsApp (lançamento, foto, consulta, dúvida). Avisos automáticos não gastam a cota.
        {data.bonus > 0 ? ` Inclui ${data.bonus} do pacote avulso.` : ""}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={data.used} aria-valuemin={0} aria-valuemax={cap}>
        <div className="h-full rounded-full bg-accent" style={{ width: `${usedPct}%` }} />
      </div>
      <div className={`mt-4 rounded-xl p-3 ${atLimit ? "bg-danger/10" : "bg-surface"}`}>
        <p className="text-sm font-semibold text-ink">Pacote avulso</p>
        <p className="mt-1 text-xs text-muted">
          {data.packSize} ações extras neste mês. O crédito entra depois do pagamento, no e-mail desta
          conta. O produto na Kiwify pode ainda estar em criação.
        </p>
        {data.checkoutUrl ? (
          <a
            href={data.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-accent px-5 text-[0.95rem] font-semibold text-[#ffffff] hover:bg-accent-dim"
          >
            Comprar pacote
          </a>
        ) : (
          <p className="mt-3 text-xs font-medium text-muted">
            A compra já está preparada. O botão aparece aqui quando o link do produto existir.
          </p>
        )}
      </div>
    </section>
  );
}

function Check({
  name,
  label,
  defaultChecked,
  disabled,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-ink">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} disabled={disabled} className="h-4 w-4" />
      {label}
    </label>
  );
}

function Note({ tone, children }: { tone: "danger" | "ok"; children: React.ReactNode }) {
  return (
    <p className={`rounded-xl px-3.5 py-2.5 text-sm ${tone === "danger" ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
      {children}
    </p>
  );
}
