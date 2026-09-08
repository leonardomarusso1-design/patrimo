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

/**
 * Enquanto não há CNPJ dedicado ao Ordre, o serviço é operado por Leonardo
 * Marusso como pessoa física (CPF). Trocar por CNPJ quando existir.
 */
export const COMPANY = {
  legalName: "Leonardo Marusso",
  owner: "Leonardo Marusso",
  doc: "CPF 473.503.798-54",
  city: "Indaiatuba – SP, Brasil",
  privacyEmail: "leonardomarusso1@gmail.com",
  supportEmail: "leonardomarusso1@gmail.com",
  securityEmail: "leonardomarusso1@gmail.com",
  instagram: "@leomvideomaker",
  instagramUrl: "https://instagram.com/leomvideomaker",
};
