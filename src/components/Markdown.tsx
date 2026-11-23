import Link from "next/link";
import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import { classifyHref, safeImageSrc } from "@/lib/markdown-href";

/**
 * Markdown dos artigos do blog. Cobre h1–h3, parágrafos, listas, tabelas,
 * regra horizontal, negrito, itálico, código, links e imagens de bloco.
 * Sem HTML bruto e sem dangerouslySetInnerHTML. Link só entra se for caminho
 * interno ou http(s); imagem só se for arquivo local.
 */

const MARK_RE = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+`|\uE000L\d+\uE001)/g;
const SLOT_RE = /\uE000L(\d+)\uE001/g;

type Slot = { label: string; href: string };

function linkNode(slot: Slot, key: string): ReactNode {
  const safe = classifyHref(slot.href);
  const children = marks(slot.label, `${key}t`, []);
  if (!safe) return <Fragment key={key}>{children}</Fragment>;
  const className = "text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand";
  if (safe.kind === "internal") {
    return (
      <Link key={key} href={safe.href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a key={key} href={safe.href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

function slotsIn(text: string, keyPrefix: string, slots: Slot[]): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = new RegExp(SLOT_RE.source, "g");
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const slot = slots[Number(m[1])];
    if (slot) nodes.push(linkNode(slot, `${keyPrefix}-l${i}`));
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function marks(text: string, keyPrefix: string, slots: Slot[]): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = new RegExp(MARK_RE.source, "g");
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(...slotsIn(text.slice(last, m.index), `${keyPrefix}-p${i}`, slots));
    const token = m[0];
    const key = `${keyPrefix}-${i}`;
    if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{slotsIn(token.slice(2, -2), key, slots)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded bg-ink/[0.06] px-1 py-0.5 text-[0.85em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key}>{slotsIn(token.slice(1, -1), key, slots)}</em>);
    } else {
      const slot = slots[Number(token.match(/\d+/)?.[0])];
      if (slot) nodes.push(linkNode(slot, key));
    }
    last = m.index + token.length;
    i++;
  }
  if (last < text.length) nodes.push(...slotsIn(text.slice(last), `${keyPrefix}-end`, slots));
  return nodes;
}

function inline(text: string, keyPrefix: string): ReactNode[] {
  const cleaned = text.replace(/[\uE000\uE001]/g, "");
  const slots: Slot[] = [];
  const marked = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, href: string) => {
    const id = slots.length;
    slots.push({ label, href });
    return `\uE000L${id}\uE001`;
  });
  return marks(marked, keyPrefix, slots);
}

export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let ordered: string[] = [];
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
  const flushOrdered = () => {
    if (ordered.length) {
      blocks.push(
        <ol key={`ol${k++}`} className="my-4 list-decimal space-y-1.5 pl-5 text-ink/90">
          {ordered.map((li, idx) => (
            <li key={idx}>{inline(li, `oli${k}-${idx}`)}</li>
          ))}
        </ol>,
      );
      ordered = [];
    }
  };
  const flushTable = () => {
    if (table.length >= 2) {
      const parse = (row: string) => row.split("|").slice(1, -1).map((c) => c.trim());
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
    flushOrdered();
    flushTable();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const img = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);

    if (img) {
      flushAll();
      const alt = img[1];
      const src = safeImageSrc(img[2]);
      if (src) {
        blocks.push(
          <figure key={`img${k++}`} className="my-8">
            <Image
              src={src}
              alt={alt}
              width={1280}
              height={720}
              sizes="(max-width: 42rem) 100vw, 42rem"
              className="h-auto w-full rounded-xl"
            />
            {alt ? <figcaption className="mt-2 text-center text-xs text-muted">{alt}</figcaption> : null}
          </figure>,
        );
      }
      continue;
    }

    if (line.startsWith("|") && line.endsWith("|")) {
      flushPara();
      flushList();
      flushOrdered();
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
      continue;
    }
    if (line.startsWith("- ")) {
      flushPara();
      flushOrdered();
      list.push(line.slice(2));
      continue;
    }
    const numbered = line.match(/^\d+\. (.*)$/);
    if (numbered) {
      flushPara();
      flushList();
      ordered.push(numbered[1]);
      continue;
    }
    flushList();
    flushOrdered();
    para.push(line);
  }
  flushAll();

  return <Fragment>{blocks}</Fragment>;
}
