import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "./Markdown";

describe("Markdown", () => {
  it("renderiza link interno, link externo e itálico no mesmo parágrafo", () => {
    const html = renderToStaticMarkup(
      <Markdown
        content={`Veja a [reserva](/blog/reserva-de-emergencia-6-ou-12-meses) e o [FGC](https://www.fgc.org.br/sobre-garantia-fgc).

*Fontes: [lei](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14754.htm) e texto.*`}
      />,
    );
    expect(html).toContain('href="/blog/reserva-de-emergencia-6-ou-12-meses"');
    expect(html).toContain('href="https://www.fgc.org.br/sobre-garantia-fgc"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("<em>");
    expect(html).toContain("planalto.gov.br");
    expect(html).not.toContain("javascript:");
  });

  it("não cria link nem imagem a partir de esquema inseguro", () => {
    const html = renderToStaticMarkup(
      <Markdown content={"[clique](javascript:alert(1))\n\n![capa](https://evil.example/a.webp)\n"} />,
    );
    expect(html).toContain("clique");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("evil.example");
    expect(html).not.toContain("<img");
  });

  it("renderiza imagem local e lista numerada", () => {
    const html = renderToStaticMarkup(
      <Markdown content={"![Professor Bento](/blog/tesouro-direto.webp)\n\n1. Primeiro passo\n2. Segundo passo\n"} />,
    );
    expect(html).toContain('alt="Professor Bento"');
    expect(html).toContain("url=%2Fblog%2Ftesouro-direto.webp");
    expect(html).toContain("<ol");
    expect(html).toContain("<figcaption");
  });
});
