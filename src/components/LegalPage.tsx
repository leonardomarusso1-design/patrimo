import { Markdown } from "@/components/Markdown";

export function LegalPage({
  title,
  updatedAt,
  content,
}: {
  title: string;
  updatedAt: string;
  content: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">Última atualização: {updatedAt}</p>
      <div className="mt-8 text-[0.95rem]">
        <Markdown content={content} />
      </div>
      <p className="mt-12 rounded-xl bg-surface p-4 text-xs text-muted">
        Dúvidas sobre este documento: {COMPANY.privacyEmail}.
      </p>
    </div>
  );
}

/** Mesma empresa e mesma redação do TOQY (toqy.com.br) e da GCard-PRÓ. */
export const COMPANY = {
  legalName: "Marusso Produções",
  owner: "Leonardo Marusso",
  cnpj: "68.194.199/0001-70",
  doc: "razão social 68.194.199 Leonardo Marusso, CNPJ 68.194.199/0001-70",
  city: "Indaiatuba – SP, Brasil",
  /** "Um produto de Marusso Produções · CNPJ … · Indaiatuba - SP" (rodapé) */
  idLine: "Um produto de Marusso Produções · CNPJ 68.194.199/0001-70 · Indaiatuba - SP",
  privacyEmail: "leonardomarusso1@gmail.com",
  supportEmail: "leonardomarusso1@gmail.com",
  securityEmail: "leonardomarusso1@gmail.com",
  instagram: "@ordre.app",
  instagramUrl: "https://www.instagram.com/ordre.app/",
};
