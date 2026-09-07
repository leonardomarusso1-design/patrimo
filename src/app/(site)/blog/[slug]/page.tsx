import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { BLOG_POSTS, getPost } from "@/content/blog";
import { Markdown } from "@/components/Markdown";
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

      <h1 className="mt-6 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-3 text-sm text-muted">
        {post.author} · {formatDate(post.publishedAt)} · {post.readingMinutes} min
      </p>

      <div className="mt-8 text-[0.98rem]">
        <Markdown content={post.content} />
      </div>

      <div className="mt-14 rounded-2xl border border-border bg-surface p-6 text-center">
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
