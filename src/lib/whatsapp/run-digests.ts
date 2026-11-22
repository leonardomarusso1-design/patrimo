import "server-only";

import { formatCurrency } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { whatsappAccess } from "./access";
import { sendTemplate } from "./client";
import { botEnabled, phonePepper, whatsappConfigured } from "./config";
import { alreadySent, dailyBillText, digestsDue } from "./digest";
import { hashPhone } from "./phone";
import { billsBetween, entryDueIso, grewMost, monthTotals, spentBetween, weekWindow } from "./reports";
import { shiftMonth, templateParam, zonedParts } from "./text";
import {
  entriesFor,
  getBotProfile,
  latestNetWorth,
  listAlertLinks,
  logOutbound,
  markDigest,
  phoneOf,
  purgeOldMessages,
} from "./store";

function templateName(kind: "daily" | "weekly" | "monthly"): string | null {
  const map = {
    daily: process.env.WHATSAPP_TEMPLATE_DAILY,
    weekly: process.env.WHATSAPP_TEMPLATE_WEEKLY,
    monthly: process.env.WHATSAPP_TEMPLATE_MONTHLY,
  };
  const name = map[kind]?.trim();
  return name || null;
}

/**
 * Lembretes e resumos só saem por modelo de utilidade aprovado pela Meta.
 * Sem o nome do modelo, o cron não manda texto livre (a janela de 24 h não vale aqui).
 */
export async function runWhatsappDigests(): Promise<{ skipped: boolean; sent: number }> {
  if (!botEnabled() || !whatsappConfigured()) return { skipped: true, sent: 0 };
  const pepper = phonePepper();
  if (!pepper) return { skipped: true, sent: 0 };

  await purgeOldMessages();
  const parts = zonedParts();
  const links = await listAlertLinks();
  let sent = 0;

  for (const link of links) {
    try {
      const profile = await getBotProfile(link.user_id);
      if (!profile || whatsappAccess(profile) === "blocked") continue;
      const phone = phoneOf(link, pepper);
      if (!phone) continue;
      const due = digestsDue(parts, {
        alerts: link.alerts_opt_in,
        daily: link.daily_digest,
        weekly: link.weekly_digest,
        monthly: link.monthly_digest,
      });
      const first = (profile.full_name ?? "").split(" ")[0] || "voce";
      const money = (n: number) => formatCurrency(n, profile.display_currency);

      for (const kind of due) {
        if (alreadySent(kind, parts.iso, link)) continue;
        const name = templateName(kind);
        if (!name) {
          logger.warn("whatsapp.digest.template_missing", { kind });
          continue;
        }
        const params = await buildParams(kind, link.user_id, parts.iso, parts.period, first, money);
        if (!params) continue;
        const id = await sendTemplate(phone, name, params);
        await markDigest(link.user_id, kind, parts.iso);
        await logOutbound(link.user_id, hashPhone(phone, pepper), id, `digest_${kind}`);
        sent += 1;
      }
    } catch (err) {
      logger.warn("whatsapp.digest.user", {
        error: err instanceof Error ? err.name : "fail",
      });
    }
  }

  logger.info("whatsapp.digest.done", { sent });
  return { skipped: false, sent };
}

async function buildParams(
  kind: "daily" | "weekly" | "monthly",
  userId: string,
  today: string,
  period: string,
  first: string,
  money: (n: number) => string,
): Promise<string[] | null> {
  if (kind === "daily") {
    const next = shiftMonth(period, 1);
    const rows = await entriesFor(userId, period, next);
    const due = billsBetween(rows, today, shiftDay(today, 1))
      .map((r) => ({ name: r.name, amount: Number(r.amount), due: entryDueIso(r) ?? today }));
    const text = dailyBillText(due, money, today);
    if (!text) return null;
    return [templateParam(first, 40), templateParam(text, 700)];
  }

  if (kind === "weekly") {
    const window = weekWindow(today);
    const rows = await entriesFor(userId, shiftMonth(period, -1), period);
    const current = spentBetween(rows, window.start, window.end);
    const previous = spentBetween(rows, window.prevStart, window.prevEnd);
    const grew = grewMost(current.byCat, previous.byCat);
    return [
      templateParam(first, 40),
      templateParam(money(current.total), 40),
      templateParam(money(previous.total), 40),
      templateParam(grew ? `${grew.name} (+${money(grew.delta)})` : "nenhuma categoria subiu", 80),
    ];
  }

  const prev = shiftMonth(period, -1);
  const rows = await entriesFor(userId, prev, prev);
  const totals = monthTotals(rows);
  const spent = totals.fixed + totals.variable;
  const saved = totals.balance;
  const net = await latestNetWorth(userId);
  const [y, m] = prev.split("-");
  const label = new Date(Date.UTC(Number(y), Number(m) - 1, 1)).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return [
    templateParam(label, 40),
    templateParam(money(spent), 40),
    templateParam(money(totals.income), 40),
    templateParam(money(saved), 40),
    templateParam(net == null ? "sem foto no painel" : money(net), 40),
  ];
}

function shiftDay(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}
