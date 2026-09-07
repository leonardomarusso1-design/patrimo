import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    ).host;
  } catch {
    return "placeholder.supabase.co";
  }
})();

const devEval = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";

const ContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${devEval} https://www.googletagmanager.com https://www.google-analytics.com https://cdn.pluggy.ai`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://www.google-analytics.com https://*.supabase.co https://cdn.pluggy.ai",
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://www.google-analytics.com https://region1.google-analytics.com https://api.pluggy.ai`,
  "frame-src 'self' https://connect.pluggy.ai",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/dashboard", destination: "/app", permanent: true },
      { source: "/pricing", destination: "/precos", permanent: true },
    ];
  },
};

export default nextConfig;
