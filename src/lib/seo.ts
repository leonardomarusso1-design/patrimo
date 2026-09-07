import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://patrimo.com.br";

export const SITE_NAME = "Patrimo";
export const SITE_DESCRIPTION =
  "Orçamento, reserva de emergência, metas, investimentos e patrimônio líquido em um só lugar. Do descontrole ao patrimônio, numa sequência só.";

export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Patrimo — Controle financeiro pessoal completo",
    template: "%s · Patrimo",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "controle financeiro",
    "orçamento pessoal",
    "reserva de emergência",
    "investimentos",
    "patrimônio",
    "planilha financeira",
    "educação financeira",
    "open finance",
  ],
  authors: [{ name: "Patrimo" }],
  creator: "Patrimo",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Patrimo — Controle financeiro pessoal completo",
    description: SITE_DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Patrimo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Patrimo — Controle financeiro pessoal completo",
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/icon.svg" },
};

export function pageMetadata(opts: {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
}): Metadata {
  return {
    title: opts.title,
    description: opts.description ?? SITE_DESCRIPTION,
    alternates: opts.path ? { canonical: opts.path } : undefined,
    robots: opts.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: `${opts.title} · Patrimo`,
      description: opts.description ?? SITE_DESCRIPTION,
      url: opts.path ? `${SITE_URL}${opts.path}` : SITE_URL,
    },
  };
}
