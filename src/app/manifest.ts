import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Patrimo",
    short_name: "Patrimo",
    description: "Controle financeiro completo, com IA.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f7f5f1",
    theme_color: "#f7f5f1",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
