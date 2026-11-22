import { describe, expect, it } from "vitest";
import { classifyHref, safeCover, safeImageSrc } from "./markdown-href";

describe("classifyHref", () => {
  it("aceita caminho interno e preserva busca e âncora", () => {
    expect(classifyHref("/app/calculadoras?c=cdi")).toEqual({
      kind: "internal",
      href: "/app/calculadoras?c=cdi",
    });
    expect(classifyHref("/blog/taxa-selic#copom")).toEqual({
      kind: "internal",
      href: "/blog/taxa-selic#copom",
    });
  });

  it("aceita http e https", () => {
    expect(classifyHref("https://www.fgc.org.br/sobre-garantia-fgc")).toEqual({
      kind: "external",
      href: "https://www.fgc.org.br/sobre-garantia-fgc",
    });
    expect(classifyHref("http://example.com/lei")).toMatchObject({ kind: "external" });
  });

  it("recusa esquema perigoso, protocolo relativo e credencial", () => {
    expect(classifyHref("javascript:alert(1)")).toBeNull();
    expect(classifyHref("JaVaScRiPt:alert(1)")).toBeNull();
    expect(classifyHref("data:text/html,hi")).toBeNull();
    expect(classifyHref("//evil.example/phish")).toBeNull();
    expect(classifyHref("https://user:secret@example.com/a")).toBeNull();
    expect(classifyHref("/\\evil.example")).toBeNull();
    expect(classifyHref("/blog/../../etc/passwd")).toBeNull();
    expect(classifyHref("/blog/%2e%2e/secret")).toBeNull();
  });
});

describe("safeImageSrc", () => {
  it("aceita imagem local e recusa remota, svg e query", () => {
    expect(safeImageSrc("/blog/tesouro-direto.webp")).toBe("/blog/tesouro-direto.webp");
    expect(safeImageSrc("https://evil.example/a.webp")).toBeNull();
    expect(safeImageSrc("/blog/a.svg")).toBeNull();
    expect(safeImageSrc("/blog/a.webp?x=1")).toBeNull();
    expect(safeImageSrc("//evil.example/a.webp")).toBeNull();
  });
});

describe("safeCover", () => {
  it("exige arquivo em /blog e texto alternativo", () => {
    expect(
      safeCover({
        src: "/blog/quanto-rende-o-cdi.webp",
        alt: "Professor Bento com uma régua.",
      }),
    ).toEqual({
      src: "/blog/quanto-rende-o-cdi.webp",
      alt: "Professor Bento com uma régua.",
    });
    expect(safeCover({ src: "/marketing/ordre-hero.png", alt: "Hero" })).toBeNull();
    expect(safeCover({ src: "/blog/a.webp", alt: "  " })).toBeNull();
    expect(safeCover(undefined)).toBeNull();
  });
});
