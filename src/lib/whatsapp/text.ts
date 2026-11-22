/** Texto puro do bot. Sem segredo e sem I/O. */

export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function titleCase(s: string): string {
  const clean = s.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  return clean
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ")
    .slice(0, 80);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Data civil em America/Sao_Paulo, sem deslocar o dia. */
export function zonedParts(now = new Date(), timeZone = "America/Sao_Paulo") {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const y = Number(get("year"));
  const m = Number(get("month"));
  const d = Number(get("day"));
  const weekday = get("weekday");
  const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return {
    y,
    m,
    d,
    weekday,
    iso,
    period: iso.slice(0, 7),
  };
}

export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function shiftMonth(period: string, delta: number): string {
  const [y, m] = period.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + delta, 1));
  return dt.toISOString().slice(0, 7);
}

const MONTHS: Record<string, number> = {
  janeiro: 1,
  jan: 1,
  fevereiro: 2,
  fev: 2,
  marco: 3,
  março: 3,
  mar: 3,
  abril: 4,
  abr: 4,
  maio: 5,
  mai: 5,
  junho: 6,
  jun: 6,
  julho: 7,
  jul: 7,
  agosto: 8,
  ago: 8,
  setembro: 9,
  set: 9,
  outubro: 10,
  out: 10,
  novembro: 11,
  nov: 11,
  dezembro: 12,
  dez: 12,
};

/** Mês citado no texto, relativo a hoje. "outubro" em janeiro cai no ano anterior. */
export function monthMentioned(text: string, todayIso: string): string | null {
  const f = fold(text);
  if (/\b(este mes|nesse mes|deste mes|mes atual)\b/.test(f)) return todayIso.slice(0, 7);
  if (/\b(mes passado|ultimo mes)\b/.test(f)) return shiftMonth(todayIso.slice(0, 7), -1);
  for (const [name, num] of Object.entries(MONTHS)) {
    const key = fold(name);
    if (key.length < 4) continue;
    if (!new RegExp(`\\b${key}\\b`).test(f)) continue;
    const current = Number(todayIso.slice(5, 7));
    const year = Number(todayIso.slice(0, 4));
    const y = num > current + 1 ? year - 1 : year;
    return `${y}-${String(num).padStart(2, "0")}`;
  }
  return null;
}

export function kindLabel(kind: "income" | "expense_fixed" | "expense_variable"): string {
  if (kind === "income") return "receita";
  if (kind === "expense_fixed") return "fixa";
  return "variável";
}

export function whenLabel(iso: string, todayIso: string): string {
  if (iso === todayIso) return "hoje";
  if (iso === addDaysIso(todayIso, -1)) return "ontem";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Parâmetro de modelo da Meta: sem quebra de linha e sem vazio. */
export function templateParam(s: string, max = 200): string {
  const clean = s.replace(/[\n\r\t]+/g, " ").replace(/\s{4,}/g, " ").replace(/\s{2,}/g, " ").trim();
  return (clean || "-").slice(0, max);
}
