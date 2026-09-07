import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { BLOG_POSTS } from "@/content/blog";
import { formatDate } from "@/lib/utils";
import { BlogCover } from "@/components/BlogCover";

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

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {posts.map((p) => (
          <article key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="group block">
              <BlogCover slug={p.slug} tag={p.tags[0]} className="h-40" />
              <h2 className="mt-3 font-display text-lg font-bold text-ink group-hover:underline">
                {p.title}
              </h2>
            </Link>
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
