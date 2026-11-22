import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { whatsappAccess } from "./access";
import { buildDraft } from "./classify";
import { botEnabled, packCheckoutUrl, readPackSize, readQuota } from "./config";
import { digestsDue } from "./digest";
import { EDUCATIONAL_DISCLAIMER, educationalReply, guardEducational, withDisclaimer } from "./invest";
import { interpretText } from "./interpret";
import { extractKiwifyProductId, isWhatsappPack } from "./kiwify-pack";
import { parseEntry, parseLinkCode } from "./parse";
import { decryptPhone, encryptPhone, hashPhone, maskPhone } from "./phone";
import { collectInbound } from "./payload";
import { quotaAllows, quotaPeriod, quotaRemaining } from "./quota";
import { billsBetween, grewMost, monthTotals, weekWindow } from "./reports";
import { verifyMetaSignature } from "./signature";
import { monthMentioned } from "./text";

const today = "2026-11-22";
const empty = {
  today,
  linked: true,
  hasPending: false,
  rules: [],
  categories: [],
};

describe("flag e cota", () => {
  it("só liga com o valor exato true", () => {
    expect(botEnabled({})).toBe(false);
    expect(botEnabled({ WHATSAPP_BOT_ENABLED: "false" })).toBe(false);
    expect(botEnabled({ WHATSAPP_BOT_ENABLED: "TRUE" })).toBe(false);
    expect(botEnabled({ WHATSAPP_BOT_ENABLED: "true" })).toBe(true);
  });

  it("cota e pacote têm padrão e respeitam o ambiente", () => {
    expect(readQuota({})).toBe(80);
    expect(readQuota({ WHATSAPP_MONTHLY_QUOTA: "40" })).toBe(40);
    expect(readPackSize({})).toBe(100);
    expect(quotaAllows(80, 0, 80)).toBe(false);
    expect(quotaAllows(80, 20, 80)).toBe(true);
    expect(quotaRemaining(70, 10, 80)).toBe(20);
  });

  it("período da cota usa o mês de Brasília", () => {
    // 01:30 UTC de 1º de dezembro ainda é 30 de novembro em São Paulo.
    expect(quotaPeriod(new Date("2026-12-01T01:30:00.000Z"))).toBe("2026-11");
    expect(quotaPeriod(new Date("2026-12-01T04:00:00.000Z"))).toBe("2026-12");
  });

  it("link de pacote só aceita https da Kiwify", () => {
    expect(packCheckoutUrl({})).toBeNull();
    expect(packCheckoutUrl({ WHATSAPP_PACK_CHECKOUT_URL: "http://pay.kiwify.com.br/abc" })).toBeNull();
    expect(packCheckoutUrl({ WHATSAPP_PACK_CHECKOUT_URL: "https://evil.example/abc" })).toBeNull();
    expect(packCheckoutUrl({ WHATSAPP_PACK_CHECKOUT_URL: "https://pay.kiwify.com.br/abc" })).toBe(
      "https://pay.kiwify.com.br/abc",
    );
  });
});

describe("parser de lançamento", () => {
  it("lanche 9,90 vira variável em alimentação, com confiança para gravar", () => {
    const got = interpretText("lanche 9,90", empty);
    expect(got.type).toBe("entry");
    if (got.type !== "entry") return;
    expect(got.draft.amount).toBe(9.9);
    expect(got.draft.name).toBe("Lanche");
    expect(got.draft.kind).toBe("expense_variable");
    expect(got.draft.category).toBe("Alimentação");
    expect(got.draft.requireConfirm).toBe(false);
    expect(got.draft.entryDate).toBe(today);
  });

  it("luz com valor vira conta fixa", () => {
    const parsed = parseEntry("paguei a luz 187,40 no pix", today);
    expect(parsed?.amount).toBe(187.4);
    const draft = buildDraft(parsed!, "paguei a luz 187,40 no pix", [], []);
    expect(draft.kind).toBe("expense_fixed");
    expect(draft.category).toBe("Contas");
    expect(draft.name).toBe("Luz");
  });

  it("salário com milhar brasileiro vira receita", () => {
    const got = interpretText("recebi 3.200 de salário", empty);
    expect(got.type).toBe("entry");
    if (got.type !== "entry") return;
    expect(got.draft.amount).toBe(3200);
    expect(got.draft.kind).toBe("income");
    expect(got.draft.category).toBe("Salário");
  });

  it("aluguel todo mês guarda recorrência e dia", () => {
    const parsed = parseEntry("vence dia 10 o aluguel 1800 todo mês", today);
    expect(parsed?.dueDay).toBe(10);
    expect(parsed?.amount).toBe(1800);
    expect(parsed?.recurringHint).toBe(true);
    const draft = buildDraft(parsed!, "vence dia 10 o aluguel 1800 todo mês", [], []);
    expect(draft.kind).toBe("expense_fixed");
    expect(draft.recurring).toBe(true);
  });

  it("parcela e ontem", () => {
    const parsed = parseEntry("notebook 3000 em 3x ontem", today);
    expect(parsed?.installments).toBe(3);
    expect(parsed?.amount).toBe(3000);
    expect(parsed?.entryDate).toBe("2026-11-21");
  });

  it("código do painel", () => {
    expect(parseLinkCode("ORDRE-123456")).toBe("123456");
    expect(parseLinkCode("123456")).toBe("123456");
    expect(parseLinkCode("lanche 9,90")).toBeNull();
    const unlinked = interpretText("ORDRE-123456", { ...empty, linked: false });
    expect(unlinked).toEqual({ type: "link", code: "123456" });
  });

  it("categoria fora da lista pede confirmação", () => {
    const got = interpretText("lanche 9,90", {
      ...empty,
      categories: [{ name: "Mercado", kind: "expense_variable" }],
    });
    expect(got.type).toBe("entry");
    if (got.type !== "entry") return;
    expect(got.draft.categoryUnlisted).toBe(true);
    expect(got.draft.requireConfirm).toBe(true);
  });

  it("regra do próprio usuário ganha da palavra-chave", () => {
    const got = interpretText("lanche 9,90", {
      ...empty,
      rules: [{ pattern: "lanche", category: "Trabalho", kind: "expense_fixed" }],
    });
    expect(got.type).toBe("entry");
    if (got.type !== "entry") return;
    expect(got.draft.category).toBe("Trabalho");
    expect(got.draft.kind).toBe("expense_fixed");
    expect(got.draft.requireConfirm).toBe(false);
  });
});

describe("consultas, correção e investimento", () => {
  it("separa relatório de lançamento", () => {
    expect(interpretText("quanto gastei com ifood em outubro", empty).type).toBe("report");
    expect(interpretText("quanto gastei este mês?", empty).type).toBe("report");
    expect(monthMentioned("quanto gastei em outubro", "2026-01-10")).toBe("2025-10");
    const paid = interpretText("paguei o aluguel", empty);
    expect(paid.type).toBe("paid");
  });

  it("compra de lanche não vira consulta de investimento", () => {
    expect(interpretText("comprei lanche 9,90", empty).type).toBe("entry");
    expect(interpretText("recebi 50 de rendimento do cdb", empty).type).toBe("entry");
  });

  it("relatório com filtro e mês", () => {
    const got = interpretText("quanto gastei com ifood em outubro", empty);
    expect(got.type).toBe("report");
    if (got.type !== "report") return;
    expect(got.query.topic).toBe("category");
    expect(got.query.filter?.toLowerCase()).toBe("ifood");
    expect(got.query.month).toBe("2026-10");
  });

  it("pergunta de ativo fica no modo educativo e leva o aviso", () => {
    const answer = educationalReply("a ação PETR4 caiu, compro?", {
      profile: "moderado",
      currency: "BRL",
      holdings: [
        { asset_class: "acao", current_amount: 5200 },
        { asset_class: "renda_fixa", current_amount: 4800 },
      ],
    }, (n) => `R$ ${n}`);
    expect(answer.needsModel).toBe(false);
    expect(answer.text).toContain(EDUCATIONAL_DISCLAIMER);
    expect(answer.text.toLowerCase()).not.toMatch(/\bcompre\b/);
    expect(answer.text).toContain("52%");
    expect(answer.text).toContain("40%");
  });

  it("filtro troca recomendação de compra pela recusa segura", () => {
    const safe = guardEducational("Recomendo comprar PETR4 agora, é um bom momento para entrar.");
    expect(safe.toLowerCase()).not.toMatch(/petr4/);
    expect(withDisclaimer(safe)).toContain("Aviso educativo");
  });

  it("explica Selic sem indicar ativo", () => {
    const answer = educationalReply("o que é a Selic?", {
      profile: null,
      currency: "BRL",
      holdings: [],
    }, (n) => String(n));
    expect(answer.needsModel).toBe(false);
    expect(answer.text.toLowerCase()).toContain("selic");
    expect(answer.text).toContain(EDUCATIONAL_DISCLAIMER);
  });
});

describe("trial", () => {
  it("libera no teste e bloqueia quando acaba", () => {
    const future = new Date(Date.now() + 3 * 86400000).toISOString();
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(whatsappAccess({ plan: "pro", plan_expires_at: future })).toBe("ok");
    expect(whatsappAccess({ plan: "pro", plan_expires_at: past })).toBe("blocked");
    expect(whatsappAccess({ plan: "free", plan_expires_at: null })).toBe("blocked");
  });
});

describe("assinatura, número e webhook", () => {
  it("confere a assinatura da Meta e recusa corpo diferente", () => {
    const secret = "app-secret";
    const body = '{"ok":true}';
    const sig = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
    expect(verifyMetaSignature(body, sig, secret)).toBe(true);
    expect(verifyMetaSignature(body + " ", sig, secret)).toBe(false);
    expect(verifyMetaSignature(body, null, secret)).toBe(false);
    expect(verifyMetaSignature(body, sig, null)).toBe(false);
  });

  it("cifra o telefone e o hash não revela os dígitos", () => {
    const pepper = "pepper-de-teste";
    const enc = encryptPhone("+55 11 98888-7777", pepper);
    expect(enc).not.toContain("98888");
    expect(decryptPhone(enc, pepper)).toBe("5511988887777");
    expect(decryptPhone(enc, "outro")).toBeNull();
    expect(hashPhone("5511988887777", pepper)).toBe(hashPhone("+55 (11) 98888-7777", pepper));
    expect(maskPhone("5511988887777")).toContain("7777");
    expect(maskPhone("5511988887777")).not.toContain("98888");
  });

  it("ignora status e grupo e lê texto e botão", () => {
    const msgs = collectInbound({
      entry: [
        {
          changes: [
            {
              value: {
                statuses: [{ id: "s1", status: "read" }],
                messages: [
                  { from: "5511999999999", id: "m1", type: "text", text: { body: "lanche 9,90" } },
                  { from: "5511999999999", id: "m2", type: "text", text: { body: "oi" }, group_id: "g1" },
                  {
                    from: "5511999999999",
                    id: "m3",
                    type: "interactive",
                    interactive: { button_reply: { id: "confirm", title: "Confirmar" } },
                  },
                ],
              },
            },
          ],
        },
      ],
    });
    expect(msgs.map((m) => m.waId)).toEqual(["m1", "m3"]);
    expect(msgs[1].buttonId).toBe("confirm");
  });
});

describe("relatórios e resumos", () => {
  const rows = [
    {
      kind: "expense_variable",
      name: "iFood",
      category: "Alimentação",
      amount: 40,
      pending: false,
      entry_date: "2026-11-10",
      due_day: null,
      reference_month: "2026-11-01",
    },
    {
      kind: "expense_fixed",
      name: "Aluguel",
      category: "Moradia",
      amount: 1800,
      pending: true,
      entry_date: "2026-11-22",
      due_day: 22,
      reference_month: "2026-11-01",
    },
    {
      kind: "income",
      name: "Salário",
      category: "Salário",
      amount: 5000,
      pending: false,
      entry_date: "2026-11-05",
      due_day: null,
      reference_month: "2026-11-01",
    },
  ];

  it("soma o mês sem contar o que ainda está previsto", () => {
    const t = monthTotals(rows);
    expect(t.income).toBe(5000);
    expect(t.variable).toBe(40);
    expect(t.fixed).toBe(0);
    expect(t.balance).toBe(4960);
  });

  it("lista conta que vence na janela", () => {
    const due = billsBetween(rows, "2026-11-22", "2026-11-23");
    expect(due.map((r) => r.name)).toEqual(["Aluguel"]);
  });

  it("acha a categoria que mais cresceu", () => {
    const grew = grewMost(new Map([["Lazer", 80]]), new Map([["Lazer", 20]]));
    expect(grew).toEqual({ name: "Lazer", delta: 60 });
  });

  it("semana anterior cabe em 7 dias", () => {
    const w = weekWindow("2026-11-23");
    expect(w.end).toBe("2026-11-22");
    expect(w.start).toBe("2026-11-16");
    expect(w.prevEnd).toBe("2026-11-15");
  });

  it("avisos só saem com opt-in, semanal na segunda e mensal no dia 1", () => {
    expect(digestsDue({ d: 22, weekday: "Sun" }, { alerts: false, daily: true, weekly: true, monthly: true })).toEqual([]);
    expect(digestsDue({ d: 23, weekday: "Mon" }, { alerts: true, daily: false, weekly: true, monthly: false })).toEqual([
      "weekly",
    ]);
    expect(digestsDue({ d: 1, weekday: "Sun" }, { alerts: true, daily: true, weekly: false, monthly: true })).toEqual([
      "daily",
      "monthly",
    ]);
  });
});

describe("pacote Kiwify", () => {
  it("reconhece o produto avulso e ignora o plano quando o id não está configurado", () => {
    const payload = { Product: { product_id: "pack-1" }, order_id: "o1" };
    expect(extractKiwifyProductId(payload)).toBe("pack-1");
    expect(isWhatsappPack(payload, null)).toBe(false);
    expect(isWhatsappPack(payload, "pack-1")).toBe(true);
    expect(isWhatsappPack(payload, "plano-anual")).toBe(false);
  });
});
