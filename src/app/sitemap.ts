import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { BLOG_POSTS } from "@/content/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/precos",
    "/blog",
    "/login",
    "/cadastro",
    "/termos",
    "/privacidade",
    "/cookies",
    "/contrato-assinatura",
    "/seguranca",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const posts = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...posts];
}
