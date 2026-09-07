export type ParsedTxn = {
  date: string; // yyyy-mm-dd (best effort)
  description: string;
  amount: number; // negativo = saída, positivo = entrada
};

/** Converte "1.234,56" ou "-1234.56" ou "R$ 89,90" em número. */
export function parseBRNumber(raw: string): number | null {
  let s = raw.replace(/[R$\s]/g, "").trim();
  if (!s) return null;
  const neg = /^-/.test(s) || /\)$/.test(s);
  s = s.replace(/[()-]/g, "");
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  }
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return neg ? -n : n;
}

function parseDate(raw: string): string {
  const s = raw.trim();
  let m = s.match(/^(\d{2})[/\-.](\d{2})[/\-.](\d{2,4})$/);
  if (m) {
    const yyyy = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${yyyy}-${m[2]}-${m[1]}`;
  }
  m = s.match(/^(\d{4})[/\-.](\d{2})[/\-.](\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return "";
}

/**
 * Parser de extrato CSV. Detecta separador (`;` ou `,`), acha as colunas de
 * data / descrição / valor pelo cabeçalho ou pela heurística.
 */
export function parseExtratoCsv(text: string): ParsedTxn[] {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const sep = (lines[0].match(/;/g)?.length ?? 0) >= (lines[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const split = (l: string) => l.split(sep).map((c) => c.replace(/^"|"$/g, "").trim());

  const header = split(lines[0]).map((h) => h.toLowerCase());
  const looksHeader = header.some((h) => /data|valor|descri|hist|lan/.test(h));
  let di = header.findIndex((h) => /data|date/.test(h));
  let ci = header.findIndex((h) => /descri|hist|lan[çc]|memo/.test(h));
  let vi = header.findIndex((h) => /valor|amount|montante/.test(h));

  const rows = looksHeader ? lines.slice(1) : lines;
  if (di < 0) di = 0;
  if (vi < 0) vi = 2;
  if (ci < 0) ci = 1;

  const out: ParsedTxn[] = [];
  for (const line of rows) {
    const cols = split(line);
    if (cols.length < 2) continue;
    const amount = parseBRNumber(cols[vi] ?? cols[cols.length - 1] ?? "");
    if (amount == null || amount === 0) continue;
    out.push({
      date: parseDate(cols[di] ?? ""),
      description: (cols[ci] ?? "Lançamento importado").slice(0, 120) || "Lançamento importado",
      amount,
    });
  }
  return out;
}
