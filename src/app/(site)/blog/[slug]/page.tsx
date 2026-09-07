import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { BLOG_POSTS, getPost } from "@/content/blog";
import { Markdown } from "@/components/Markdown";
import { BlogCover } from "@/components/BlogCover";
import { formatDate } from "@/lib/utils";
import { SITE_URL } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/Button";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Artigo não encontrado" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Patrimo" },
  };

  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-accent-dim hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Todos os artigos
      </Link>

      <BlogCover slug={post.slug} tag={post.tags[0]} className="mt-6 h-44 sm:h-52" />

      <h1 className="mt-6 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
          {post.category}
        </span>
        {post.author} · {formatDate(post.publishedAt)} · {post.readingMinutes} min
      </p>

      <div className="mt-8 text-[0.98rem]">
        <Markdown content={post.content} />
      </div>

      {post.calc && (
        <div className="mt-12 rounded-2xl border border-brand/30 bg-brand-50 p-6">
          <p className="font-display text-lg font-bold text-brand-700">
            Faça a conta com seus números
          </p>
          <p className="mt-1 text-sm text-brand-700/80">
            Este artigo tem uma calculadora no Patrimo. Ela fica na sua conta —
            disponível para assinantes.
          </p>
          <ButtonLink href={`/app/calculadoras?c=${post.calc}`} className="mt-4">
            Abrir a calculadora
          </ButtonLink>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="font-display text-lg font-bold text-ink">
          Coloque isso em prática hoje
        </p>
        <p className="mt-1 text-sm text-muted">
          O Patrimo faz as contas por você — orçamento a patrimônio, numa tela só.
        </p>
        <ButtonLink href="/cadastro" className="mt-4">
          Criar minha conta
        </ButtonLink>
      </div>
    </article>
  );
}
