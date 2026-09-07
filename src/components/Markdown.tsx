import { Fragment, type ReactNode } from "react";

/**
 * Renderizador de Markdown minimalista para os artigos do blog (conteúdo próprio,
 * confiável). Cobre: h1–h3, parágrafos, listas, tabelas, regra horizontal,
 * **negrito**, *itálico*, `código`. Sem HTML bruto — nada de dangerouslySetInnerHTML.
 */

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("**"))
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("`"))
      nodes.push(
        <code key={key} className="rounded bg-ink/[0.06] px-1 py-0.5 text-[0.85em]">
          {token.slice(1, -1)}
        </code>,
      );
    else nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let table: string[] = [];
  let k = 0;

  const flushPara = () => {
    if (para.length) {
      blocks.push(
        <p key={`p${k++}`} className="my-4 leading-relaxed text-ink/90">
          {inline(para.join(" "), `p${k}`)}
        </p>,
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={`ul${k++}`} className="my-4 list-disc space-y-1.5 pl-5 text-ink/90">
          {list.map((li, idx) => (
            <li key={idx}>{inline(li, `li${k}-${idx}`)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  const flushTable = () => {
    if (table.length >= 2) {
      const parse = (row: string) =>
        row.split("|").slice(1, -1).map((c) => c.trim());
      const head = parse(table[0]);
      const body = table.slice(2).map(parse);
      blocks.push(
        <div key={`tb${k++}`} className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                {head.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-semibold text-ink">
                    {inline(h, `th${k}-${i}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri} className="border-b border-border/60">
                  {r.map((c, ci) => (
                    <td key={ci} className="px-3 py-2 text-ink/85">
                      {inline(c, `td${k}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    }
    table = [];
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushTable();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith("|") && line.endsWith("|")) {
      flushPara();
      flushList();
      table.push(line);
      continue;
    }
    if (table.length) flushTable();

    if (!line.trim()) {
      flushAll();
      continue;
    }
    if (line === "---") {
      flushAll();
      blocks.push(<hr key={`hr${k++}`} className="my-8 border-border" />);
      continue;
    }
    if (line.startsWith("### ")) {
      flushAll();
      blocks.push(
        <h3 key={`h3${k++}`} className="mt-8 font-display text-lg font-bold text-ink">
          {inline(line.slice(4), `h3${k}`)}
        </h3>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushAll();
      blocks.push(
        <h2 key={`h2${k++}`} className="mt-10 font-display text-xl font-bold text-ink">
          {inline(line.slice(3), `h2${k}`)}
        </h2>,
      );
      continue;
    }
    if (line.startsWith("# ")) {
      flushAll();
      continue; // o título já vem do cabeçalho do post
    }
    if (line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2));
      continue;
    }
    flushList();
    para.push(line);
  }
  flushAll();

  return <Fragment>{blocks}</Fragment>;
}
