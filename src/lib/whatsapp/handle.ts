import "server-only";

import { formatCurrency } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { whatsappAccess } from "./access";
import { matchCategoryName, type EntryDraft } from "./classify";
import {
  BAD_CODE,
  FIX_HINT,
  NOT_A_PHOTO,
  PHOTO_UNREADABLE,
  PHOTO_UNSUPPORTED,
  UNLINKED_HINT,
  askCategoryText,
  blockedText,
  confirmText,
  helpText,
  quotaText,
  savedText,
  welcomeText,
} from "./copy";
import { LIMITS, phonePepper, readQuota, siteUrl, whatsappConfigured } from "./config";
import { educationalReply, withDisclaimer } from "./invest";
import { interpretTap, interpretText, type Interpretation } from "./interpret";
import { parseLinkCode } from "./parse";
import { explainConcept, extractReceipt, refineDraft } from "./llm";
import { downloadMedia, sendButtons, sendText } from "./client";
import type { Inbound } from "./payload";
import { hashPhone } from "./phone";
import { titleCase, zonedParts } from "./text";
import { billsBetween, monthTotals } from "./reports";
import {
  bindPhone,
  ciphertextFor,
  clearPending,
  consumeQuota,
  countSince,
  deleteInbound,
  entriesFor,
  findLinkByPhone,
  findUserByCode,
  getBotProfile,
  getPending,
  holdingsOf,
  insertEntry,
  latestNetWorth,
  loadClassifyContext,
  logOutbound,
  markAction,
  markPaid,
  patchLast,
  phoneInUse,
  recordInbound,
  refundQuota,
  rememberRule,
  reserveOf,
  savePrefs,
  setPending,
  undoLast,
  windowStart,
  type LinkRow,
  type Pending,
} from "./store";
import { claimPendingPacks } from "./packs";

type Session = {
  waId: string;
  from: string;
  phoneHash: string;
  pepper: string;
  link: LinkRow;
  replied: boolean;
};

export async function handleInbound(msg: Inbound): Promise<void> {
  if (!whatsappConfigured()) {
    logger.error("whatsapp.misconfigured");
    return;
  }
  const pepper = phonePepper();
  if (!pepper) return;
  const phoneHash = hashPhone(msg.from, pepper);
  const recorded = await recordInbound({ waId: msg.waId, phoneHash, kind: msg.type });
  if (recorded === "dup") return;

  let replied = false;
  try {
    const recent = await countSince(phoneHash, windowStart(60_000));
    if (recent > LIMITS.perMinute) {
      await markAction(msg.waId, "rate_limited");
      return;
    }

    const link = await findLinkByPhone(phoneHash);
    if (!link?.active || !link.phone_ciphertext) {
      await handleUnlinked(msg, phoneHash, pepper);
      replied = true;
      return;
    }

    const session: Session = { waId: msg.waId, from: msg.from, phoneHash, pepper, link, replied: false };
    await handleLinked(session, msg);
    replied = session.replied;
  } catch (err) {
    if (!replied) await deleteInbound(msg.waId);
    throw err;
  }
}

async function reply(session: Session, body: string, action: string, buttons?: { id: string; title: string }[]) {
  const id = buttons?.length
    ? await sendButtons(session.from, body, buttons)
    : await sendText(session.from, body);
  session.replied = true;
  await markAction(session.waId, action, session.link.user_id);
  await logOutbound(session.link.user_id, session.phoneHash, id, action);
}

async function billable(session: Session, run: () => Promise<void>) {
  const slot = await consumeQuota(session.link.user_id, readQuota());
  if (!slot.ok) {
    await reply(session, quotaText(slot.cap), "quota");
    return;
  }
  try {
    await run();
  } catch (err) {
    await refundQuota(session.link.user_id);
    throw err;
  }
}

async function handleUnlinked(msg: Inbound, phoneHash: string, pepper: string) {
  const text = msg.text ?? "";
  const code = interpretText(text, {
    today: zonedParts().iso,
    linked: false,
    hasPending: false,
    rules: [],
    categories: [],
  });
  if (code.type === "link") {
    const fails = await countSince(phoneHash, windowStart(15 * 60_000), ["link_failed"]);
    if (fails >= LIMITS.codeFailsPer15Min) {
      await markAction(msg.waId, "link_failed");
      return;
    }
    const userId = await findUserByCode(code.code, pepper);
    if (!userId) {
      await markAction(msg.waId, "link_failed");
      await sendText(msg.from, BAD_CODE);
      await logOutbound(null, phoneHash, null, "link_failed");
      return;
    }
    if (await phoneInUse(hashPhone(msg.from, pepper), userId)) {
      await markAction(msg.waId, "link_failed", userId);
      await sendText(msg.from, "Esse número já está em outra conta Ordre. Desconecte lá no painel antes.");
      return;
    }
    await bindPhone(userId, hashPhone(msg.from, pepper), ciphertextFor(msg.from, pepper));
    const profile = await getBotProfile(userId);
    const first = (profile?.full_name ?? "").split(" ")[0] ?? "";
    await markAction(msg.waId, "link", userId);
    await sendText(msg.from, welcomeText(first));
    await logOutbound(userId, phoneHash, null, "link");
    logger.info("whatsapp.linked");
    return;
  }

  const hints = await countSince(phoneHash, windowStart(60 * 60_000), ["link_hint"]);
  if (hints >= LIMITS.unlinkedPerHour) {
    await markAction(msg.waId, "link_hint");
    return;
  }
  await markAction(msg.waId, "link_hint");
  await sendText(msg.from, UNLINKED_HINT);
  await logOutbound(null, phoneHash, null, "link_hint");
}

async function handleLinked(session: Session, msg: Inbound) {
  const profile = await getBotProfile(session.link.user_id);
  if (!profile || whatsappAccess(profile) === "blocked") {
    await reply(session, blockedText(), "blocked");
    return;
  }
  await claimPendingPacks(profile.id, profile.email);
  const today = zonedParts().iso;
  const money = (n: number) => formatCurrency(n, profile.display_currency);

  if (msg.type === "other") {
    await reply(session, NOT_A_PHOTO, "help");
    return;
  }

  if (msg.type === "image" && msg.mediaId) {
    await billable(session, async () => {
      const file = await downloadMedia(msg.mediaId!);
      if (!file) {
        await refundQuota(session.link.user_id);
        await reply(session, PHOTO_UNSUPPORTED, "photo");
        return;
      }
      let receipt: Awaited<ReturnType<typeof extractReceipt>> = null;
      try {
        receipt = await extractReceipt(file.bytes, file.mime);
      } finally {
        file.bytes.fill(0);
      }
      if (!receipt?.total) {
        await refundQuota(session.link.user_id);
        await reply(session, PHOTO_UNREADABLE, "photo");
        return;
      }
      const ctx = await loadClassifyContext(profile.id);
      const caption = [receipt.merchant, msg.text].filter(Boolean).join(" ");
      const interpreted = interpretText(`${caption} ${receipt.total.toFixed(2).replace(".", ",")}`, {
        today: receipt.date && within(receipt.date, today) ? receipt.date : today,
        linked: true,
        hasPending: false,
        ...ctx,
      });
      if (interpreted.type !== "entry") {
        await reply(session, PHOTO_UNREADABLE, "photo");
        return;
      }
      const draft: EntryDraft = {
        ...interpreted.draft,
        name: receipt.merchant ? titleCase(receipt.merchant) : interpreted.draft.name,
        entryDate: receipt.date && within(receipt.date, today) ? receipt.date : today,
        requireConfirm: true,
        confidence: Math.min(interpreted.draft.confidence, 0.7),
      };
      await setPending(profile.id, "confirm", draft);
      await reply(session, `Li na foto: ${confirmText(draft, today, profile.display_currency)} A imagem não fica guardada.`, "photo", [
        { id: "confirm", title: "Confirmar" },
        { id: "cancel", title: "Cancelar" },
      ]);
    });
    return;
  }

  if (parseLinkCode(msg.text ?? "")) {
    await reply(session, "Este número já está conectado à sua conta. Para trocar, desconecte no painel e gere outro código.", "help");
    return;
  }

  const pending = await getPending(profile.id);
  const ctx = await loadClassifyContext(profile.id);
  const tapped = msg.buttonId ? interpretTap(msg.buttonId) : null;
  const interpreted =
    tapped ??
    interpretText(msg.text ?? "", {
      today,
      linked: true,
      hasPending: Boolean(pending),
      ...ctx,
    });

  await dispatch(
    session,
    interpreted,
    pending,
    profile.display_currency,
    today,
    money,
    ctx.categories,
    msg.text ?? "",
  );
}

function within(iso: string, today: string): boolean {
  return iso <= today && iso >= `${Number(today.slice(0, 4)) - 2}${today.slice(4)}`;
}

async function dispatch(
  session: Session,
  interpreted: Interpretation,
  pending: Pending | null,
  currency: string,
  today: string,
  money: (n: number) => string,
  categories: { name: string; kind: EntryDraft["kind"] }[],
  rawText: string,
) {
  const userId = session.link.user_id;

  if (interpreted.type === "help" || interpreted.type === "unknown") {
    await reply(session, interpreted.type === "help" ? helpText() : `${helpText()}`, "help");
    return;
  }
  if (interpreted.type === "stop") {
    await savePrefs(userId, {
      alerts: false,
      daily: session.link.daily_digest,
      weekly: session.link.weekly_digest,
      monthly: session.link.monthly_digest,
    });
    await reply(session, "Parei os avisos. Lançamento e consulta por mensagem continuam. Para ligar de novo, use o painel.", "stop");
    return;
  }
  if (interpreted.type === "fix_prompt") {
    await reply(session, FIX_HINT, "help");
    return;
  }

  await billable(session, async () => {
    if (interpreted.type === "cancel") {
      await clearPending(userId);
      await reply(session, "Beleza, não anotei.", "cancel");
      return;
    }
    if (interpreted.type === "undo") {
      const ok = await undoLast(userId);
      await clearPending(userId);
      await reply(session, ok ? "Desfeito. Tirei o último lançamento do WhatsApp." : "Não achei um lançamento recente para desfazer.", "undo");
      return;
    }
    if (interpreted.type === "confirm") {
      if (!pending) {
        await reply(session, "Não tenho nada pendente. Manda o lançamento, por exemplo: lanche 9,90", "help");
        return;
      }
      await saveDraft(session, pending.draft, today, currency);
      return;
    }
    if (interpreted.type === "correct_amount" || interpreted.type === "correct_kind" || interpreted.type === "correct_category") {
      await correct(session, interpreted, pending, today, currency, categories);
      return;
    }
    if (interpreted.type === "paid") {
      const result = await markPaid(userId, interpreted.query);
      const text =
        result === "one"
          ? "Marquei como pago no painel."
          : result === "many"
            ? "Achei mais de uma conta com esse nome. Manda o nome mais completo."
            : "Não achei uma conta prevista com esse nome. Se for um gasto novo, manda o valor junto.";
      await reply(session, text, "paid");
      return;
    }
    if (interpreted.type === "report") {
      await reply(session, await reportText(userId, interpreted.query, today, money), "report");
      return;
    }
    if (interpreted.type === "invest") {
      const profile = await getBotProfile(userId);
      const holdings = await holdingsOf(userId);
      const answer = educationalReply(interpreted.question, {
        profile: profile?.investor_profile ?? null,
        currency,
        holdings,
      }, money);
      let text = answer.text;
      if (answer.needsModel) {
        const model = await explainConcept(interpreted.question);
        text = withDisclaimer(
          model ??
            "Posso explicar Selic, CDI, inflação, Tesouro, CDB, LCI, FII, ETF, ação, FGC, risco, liquidez, juros compostos e a regra dos 4%. Também comparo a sua carteira com o seu perfil. Não indico ativo.",
        );
      }
      await reply(session, text, "invest");
      return;
    }
    if (interpreted.type === "entry") {
      let draft = interpreted.draft;
      if (draft.requireConfirm) draft = await refineDraft(rawText, draft, categories);
      await presentEntry(session, draft, today, currency, categories);
      return;
    }
    await reply(session, helpText(), "help");
  });
}

async function presentEntry(
  session: Session,
  draft: EntryDraft,
  today: string,
  currency: string,
  categories: { name: string }[],
) {
  if (!draft.requireConfirm) {
    await saveDraft(session, draft, today, currency);
    return;
  }
  const needsCategory = draft.categoryUnlisted || !draft.category;
  await setPending(session.link.user_id, needsCategory ? "category" : "confirm", draft);
  if (needsCategory) {
    const buttons = [
      ...(draft.category ? [{ id: "confirm", title: "Usar esta" }] : []),
      { id: "cancel", title: "Cancelar" },
    ];
    await reply(
      session,
      askCategoryText(draft, today, categories.map((c) => c.name), currency),
      "entry",
      buttons,
    );
    return;
  }
  await reply(session, confirmText(draft, today, currency), "entry", [
    { id: "confirm", title: "Confirmar" },
    { id: "cancel", title: "Cancelar" },
  ]);
}

async function saveDraft(session: Session, draft: EntryDraft, today: string, currency: string) {
  await insertEntry(session.link.user_id, draft);
  await rememberRule(session.link.user_id, draft);
  await clearPending(session.link.user_id);
  await reply(session, savedText(draft, today, currency), "entry", [
    { id: "undo", title: "Desfazer" },
    { id: "fix", title: "Corrigir" },
  ]);
  logger.info("whatsapp.entry");
}

async function correct(
  session: Session,
  interpreted: Extract<Interpretation, { type: "correct_amount" | "correct_kind" | "correct_category" }>,
  pending: Pending | null,
  today: string,
  currency: string,
  categories: { name: string; kind: EntryDraft["kind"] }[],
) {
  if (pending) {
    const draft = { ...pending.draft };
    if (interpreted.type === "correct_amount") draft.amount = interpreted.amount;
    if (interpreted.type === "correct_kind") draft.kind = interpreted.kind;
    if (interpreted.type === "correct_category") {
      const matched = matchCategoryName(categories, interpreted.category);
      draft.category = matched ?? titleCase(interpreted.category);
      draft.categoryUnlisted = !matched && categories.length > 0;
    }
    draft.requireConfirm = true;
    await setPending(session.link.user_id, "confirm", draft);
    await reply(session, confirmText(draft, today, currency), "entry", [
      { id: "confirm", title: "Confirmar" },
      { id: "cancel", title: "Cancelar" },
    ]);
    return;
  }
  const patch =
    interpreted.type === "correct_amount"
      ? { amount: interpreted.amount }
      : interpreted.type === "correct_kind"
        ? { kind: interpreted.kind }
        : { category: titleCase(interpreted.category) };
  const ok = await patchLast(session.link.user_id, patch);
  await reply(
    session,
    ok ? "Atualizei o último lançamento." : "Não achei um lançamento recente para corrigir. Manda de novo com o valor.",
    "entry",
  );
}

async function reportText(
  userId: string,
  query: { topic: string; month: string | null; filter: string | null },
  today: string,
  money: (n: number) => string,
): Promise<string> {
  const month = query.month ?? today.slice(0, 7);
  const base = siteUrl();
  if (query.topic === "reserve") {
    const r = await reserveOf(userId);
    const missing = Math.max(r.target - r.saved, 0);
    return `Reserva: ${money(r.saved)} de ${money(r.target)}. ${missing > 0 ? `Faltam ${money(missing)}.` : "Meta batida."} ${base}/app/reserva`;
  }
  if (query.topic === "networth") {
    const n = await latestNetWorth(userId);
    return n == null
      ? `Ainda não tenho uma foto do patrimônio líquido. Ela aparece no painel: ${base}/app/patrimonio`
      : `Patrimônio líquido na última foto do painel: ${money(n)}. ${base}/app/patrimonio`;
  }
  if (query.topic === "bills") {
    const rows = await entriesFor(userId, today.slice(0, 7), shift(today.slice(0, 7), 1));
    const due = billsBetween(rows, today, addDays(today, 7));
    if (!due.length) return `Nenhuma conta prevista para os próximos 7 dias. ${base}/app/vencimentos`;
    const lines = due.slice(0, 8).map((r) => `${r.name}: ${money(Number(r.amount))}`);
    const total = due.reduce((s, r) => s + Number(r.amount), 0);
    return `Contas previstas em 7 dias (${money(total)}):\n${lines.join("\n")}\n${base}/app/vencimentos`;
  }
  const rows = await entriesFor(userId, month, month);
  const totals = monthTotals(rows, query.topic === "category" ? query.filter : null);
  if (query.topic === "category") {
    const spent = totals.fixed + totals.variable;
    return query.filter
      ? `Em ${labelMonth(month)}, ${money(spent)} em "${query.filter}". ${base}/app/relatorios`
      : `Em ${labelMonth(month)} as despesas somam ${money(spent)}. ${base}/app/relatorios`;
  }
  if (query.topic === "income") {
    return `Receitas de ${labelMonth(month)}: ${money(totals.income)}. ${base}/app/relatorios`;
  }
  if (query.topic === "spent") {
    return `Gastos de ${labelMonth(month)}: ${money(totals.fixed + totals.variable)} (fixo ${money(totals.fixed)}, variável ${money(totals.variable)}). ${base}/app/relatorios`;
  }
  const top = totals.top[0] ? ` Maior categoria: ${totals.top[0].name} (${money(totals.top[0].amount)}).` : "";
  return `Resumo de ${labelMonth(month)}: receitas ${money(totals.income)}, gastos ${money(totals.fixed + totals.variable)}, saldo ${money(totals.balance)}.${top} ${base}/app/relatorios`;
}

function labelMonth(period: string): string {
  const [y, m] = period.split("-").map(Number);
  const s = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  return s;
}

function shift(period: string, delta: number): string {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}
