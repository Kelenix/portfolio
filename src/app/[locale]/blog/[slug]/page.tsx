import { prisma } from "@/lib/db";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { boldMarkdown } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Article introuvable" };
  return { title: post.titleFr };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const isEn = locale === "en";
  const isIt = locale === "it";

  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } });
  if (!post) notFound();

  const title = isEn ? post.titleEn : isIt ? post.titleIt : post.titleFr;
  const content = isEn ? post.contentEn : isIt ? post.contentIt : post.contentFr;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/blog"
        className="text-xs font-mono mb-8 block hover:opacity-70 transition-opacity"
        style={{ color: "var(--muted-foreground)" }}
      >
        ← Blog
      </Link>

      <article>
        <header className="mb-10">
          <h1
            className="text-2xl font-mono font-bold mb-3"
            style={{ color: "var(--foreground)" }}
          >
            {title}
          </h1>
          {post.publishedAt && (
            <time
              className="text-xs font-mono"
              style={{ color: "var(--muted-foreground)" }}
              dateTime={post.publishedAt.toISOString()}
            >
              {new Date(post.publishedAt).toLocaleDateString(
                locale === "en" ? "en-US" : locale === "it" ? "it-IT" : "fr-FR",
                { year: "numeric", month: "long", day: "numeric" }
              )}
            </time>
          )}
        </header>

        <div
          className="prose prose-sm max-w-none"
          style={{ color: "var(--foreground)" }}
        >
          {content.split("\n\n").map((paragraph, i) => (
            <p
              key={i}
              className="mb-4 leading-relaxed text-sm"
              style={{ color: "var(--foreground)" }}
              dangerouslySetInnerHTML={{ __html: boldMarkdown(paragraph) }}
            />
          ))}
        </div>
      </article>
    </div>
  );
}
