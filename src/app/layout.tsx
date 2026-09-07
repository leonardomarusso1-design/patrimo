import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope } from "next/font/google";
import "./globals.css";
import { baseMetadata } from "@/lib/seo";
import { CookieConsent } from "@/components/CookieConsent";
import { Analytics } from "@/components/Analytics";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  themeColor: "#f7f5f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${unbounded.variable} ${manrope.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
