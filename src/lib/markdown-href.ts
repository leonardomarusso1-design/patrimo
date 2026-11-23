/**
 * URLs aceitas no Markdown do blog.
 * Conteúdo é nosso, mas o renderizador não deve transformar um link ou uma
 * imagem em javascript:, data: ou um endereço externo disfarçado de caminho.
 */

const ORIGIN = "https://ordre.local";
const IMAGE_EXT = /\.(avif|gif|jpe?g|png|webp)$/i;

export type SafeHref =
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string };

function hasControlOrSpace(value: string) {
  return /[\u0000-\u001F\u007F\s<>\\]/.test(value);
}

function decodePath(pathname: string): string | null {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return null;
  }
}

/** Caminho interno (`/blog/...`) ou http(s). Qualquer outro esquema volta null. */
export function classifyHref(raw: string): SafeHref | null {
  const href = raw.trim();
  if (!href || hasControlOrSpace(href)) return null;

  if (href.startsWith("/") && !href.startsWith("//")) {
    const pathOnly = href.split(/[?#]/)[0] ?? href;
    if (pathOnly.split("/").includes("..")) return null;
    if (/%2e|%2f|%5c/i.test(pathOnly)) return null;

    let url: URL;
    try {
      url = new URL(href, ORIGIN);
    } catch {
      return null;
    }
    if (url.origin !== ORIGIN) return null;
    const decoded = decodePath(url.pathname);
    if (!decoded || decoded.split("/").includes("..") || decoded.includes("\\")) return null;
    return { kind: "internal", href: `${url.pathname}${url.search}${url.hash}` };
  }

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  return { kind: "external", href: url.href };
}

/** Só imagem local, sem query string e sem SVG. */
export function safeImageSrc(raw: string): string | null {
  const href = raw.trim();
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  const safe = classifyHref(href);
  if (!safe || safe.kind !== "internal") return null;
  let url: URL;
  try {
    url = new URL(safe.href, ORIGIN);
  } catch {
    return null;
  }
  if (url.search || url.hash) return null;
  if (!IMAGE_EXT.test(url.pathname)) return null;
  return url.pathname;
}

export function safeCover(
  cover: { src: string; alt: string } | undefined,
): { src: string; alt: string } | null {
  if (!cover) return null;
  const src = safeImageSrc(cover.src);
  if (!src?.startsWith("/blog/")) return null;
  const alt = cover.alt.replace(/\s+/g, " ").trim();
  if (!alt || alt.length > 400) return null;
  return { src, alt };
}
