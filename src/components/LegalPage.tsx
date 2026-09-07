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
        Este documento é um modelo operacional da Patrimo e deve ser revisado por
        assessoria jurídica antes de qualquer uso comercial. Dúvidas:
        privacidade@patrimo.com.br.
      </p>
    </div>
  );
}

export const COMPANY = {
  legalName: "Marusso Produções",
  owner: "Leonardo Marusso",
  doc: "CPF 473.503.798-54",
  city: "Indaiatuba – SP, Brasil",
  privacyEmail: "privacidade@patrimo.com.br",
  supportEmail: "suporte@patrimo.com.br",
  securityEmail: "seguranca@patrimo.com.br",
};
