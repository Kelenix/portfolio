import { prisma } from "@/lib/db";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Link } from "@/i18n/navigation";
import { Markdown, stripMarkdown } from "@/lib/markdown";
import {
  type AppLocale,
  buildLanguageAlternates,
  localizedPath,
  pickLocaleField,
  getSiteUrl,
} from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

function excerpt(content: string, max = 160): string {
  const plain = stripMarkdown(content);
  if (plain.length <= max) return plain;
  return plain.slice(0, max - 1).trimEnd() + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await getLocale()) as AppLocale;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Article introuvable", robots: { index: false } };

  const title = pickLocaleField(locale, {
    fr: post.titleFr,
    en: post.titleEn,
    it: post.titleIt,
  });
  const content = pickLocaleField(locale, {
    fr: post.contentFr,
    en: post.contentEn,
    it: post.contentIt,
  });
  const description = excerpt(content);
  const url = localizedPath(locale, `/blog/${post.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(`/blog/${post.slug}`),
    },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getLocale()) as AppLocale;
  const isEn = locale === "en";
  const isIt = locale === "it";

  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } });
  if (!post) notFound();

  const profile = await prisma.profile.findFirst({ where: { id: "default" } });

  const title = isEn ? post.titleEn : isIt ? post.titleIt : post.titleFr;
  const content = isEn ? post.contentEn : isIt ? post.contentIt : post.contentFr;

  const authorName = profile
    ? pickLocaleField(locale, {
        fr: profile.nameFr,
        en: profile.nameEn,
        it: profile.nameIt,
      })
    : "Author";

  const url = localizedPath(locale, `/blog/${post.slug}`);
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt(content),
    inLanguage: locale,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: {
      "@type": "Person",
      name: authorName,
      url: localizedPath(locale, "/"),
    },
    publisher: {
      "@type": "Person",
      name: authorName,
      url: siteUrl,
    },
    image: profile?.photoUrl ? [profile.photoUrl] : undefined,
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Script
        id="blogpost-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

        <div className="max-w-none">
          <Markdown source={content} />
        </div>
      </article>
    </div>
  );
}
