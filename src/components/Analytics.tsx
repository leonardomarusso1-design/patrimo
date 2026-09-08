"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { readConsent, type ConsentState } from "@/components/CookieConsent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** GA4 só carrega após consentimento de análise (LGPD). */
export function Analytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(!!readConsent()?.analytics);
    sync();
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState>).detail;
      setAllowed(!!detail?.analytics);
    };
    window.addEventListener("ordre:consent", onConsent);
    return () => window.removeEventListener("ordre:consent", onConsent);
  }, []);

  if (!GA_ID || !allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
