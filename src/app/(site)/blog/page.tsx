import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { BLOG_POSTS, BLOG_CATEGORY_ORDER } from "@/content/blog";
import { formatDate } from "@/lib/utils";
import { BlogCover } from "@/components/BlogCover";

export const metadata = pageMetadata({
  title: "Blog",
  description:
    "Educação financeira baseada em evidência: orçamento, reserva, investimentos, indicadores e as calculadoras do Patrimo.",
  path: "/blog",
});

export default function BlogIndex() {
  const byCat = BLOG_CATEGORY_ORDER.map((cat) => ({
    cat,
    posts: BLOG_POSTS.filter((p) => p.category === cat).sort(
      (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
    ),
  })).filter((g) => g.posts.length > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink sm:text-5xl">Blog</h1>
      <p className="mt-3 text-muted">Dinheiro explicado com fonte, não com achismo.</p>

      <nav className="mt-8 flex flex-wrap gap-2">
        {byCat.map((g) => (
          <a
            key={g.cat}
            href={`#${slugifyCat(g.cat)}`}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted hover:border-brand/40 hover:text-brand"
          >
            {g.cat}
          </a>
        ))}
      </nav>

      {byCat.map((g) => (
        <section key={g.cat} id={slugifyCat(g.cat)} className="mt-14 scroll-mt-24">
          <h2 className="font-display text-xl font-bold text-ink">{g.cat}</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            {g.posts.map((p) => (
              <article key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="group block">
                  <BlogCover slug={p.slug} tag={p.tags[0]} className="h-40" />
                  <h3 className="mt-3 font-display text-lg font-bold text-ink group-hover:underline">
                    {p.title}
                  </h3>
                </Link>
                <p className="mt-2 text-sm text-muted">{p.excerpt}</p>
                <p className="mt-3 text-xs text-muted">
                  {formatDate(p.publishedAt)} · {p.readingMinutes} min
                  {p.calc ? " · tem calculadora" : ""}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function slugifyCat(c: string) {
  return c
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}
