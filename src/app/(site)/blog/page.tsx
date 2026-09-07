import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { BLOG_POSTS } from "@/content/blog";
import { formatDate } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Blog",
  description: "Educação financeira baseada em evidência: orçamento, reserva, investimentos e independência.",
  path: "/blog",
});

export default function BlogIndex() {
  const posts = [...BLOG_POSTS].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink sm:text-5xl">Blog</h1>
      <p className="mt-3 text-muted">
        Dinheiro explicado com fonte, não com achismo.
      </p>

      <div className="mt-12 divide-y divide-border">
        {posts.map((p) => (
          <article key={p.slug} className="py-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-dim">
              {p.tags.join(" · ")}
            </p>
            <h2 className="mt-2 font-display text-xl font-bold text-ink">
              <Link href={`/blog/${p.slug}`} className="hover:underline">
                {p.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-muted">{p.excerpt}</p>
            <p className="mt-3 text-xs text-muted">
              {formatDate(p.publishedAt)} · {p.readingMinutes} min de leitura
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
