import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ordre",
    short_name: "Ordre",
    description: "Controle financeiro completo, com IA.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f5f7f4",
    theme_color: "#f5f7f4",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
