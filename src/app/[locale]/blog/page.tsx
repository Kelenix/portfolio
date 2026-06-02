import { prisma } from "@/lib/db";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  type AppLocale,
  buildLanguageAlternates,
  localizedPath,
} from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blog");
  const locale = (await getLocale()) as AppLocale;
  const title = t("title");
  const description = t("subtitle");
  return {
    title,
    description,
    alternates: {
      canonical: localizedPath(locale, "/blog"),
      languages: buildLanguageAlternates("/blog"),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: localizedPath(locale, "/blog"),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogPage() {
  const t = await getTranslations("blog");
  const locale = await getLocale();
  const isEn = locale === "en";
  const isIt = locale === "it";

  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      titleFr: true,
      titleEn: true,
      titleIt: true,
      slug: true,
      publishedAt: true,
    },
  });

  const getTitle = (post: (typeof posts)[number]) =>
    isEn ? post.titleEn : isIt ? post.titleIt : post.titleFr;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1
        className="text-2xl font-mono font-bold mb-3"
        style={{ color: "var(--foreground)" }}
      >
        {t("title")}
      </h1>
      <p className="text-sm mb-12" style={{ color: "var(--muted-foreground)" }}>
        {t("subtitle")}
      </p>

      {posts.length === 0 ? (
        <p className="text-sm font-mono" style={{ color: "var(--muted-foreground)" }}>
          {t("empty")}
        </p>
      ) : (
        <div className="space-y-0 divide-y" style={{ borderColor: "var(--border)" }}>
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block py-6 group transition-opacity hover:opacity-70"
            >
              <div className="flex items-start justify-between gap-4">
                <h2
                  className="text-sm font-mono font-semibold group-hover:underline"
                  style={{ color: "var(--foreground)" }}
                >
                  {getTitle(post)}
                </h2>
                {post.publishedAt && (
                  <time
                    className="text-xs font-mono shrink-0 mt-0.5"
                    style={{ color: "var(--muted-foreground)" }}
                    dateTime={post.publishedAt.toISOString()}
                  >
                    {new Date(post.publishedAt).toLocaleDateString(
                      locale === "en" ? "en-US" : locale === "it" ? "it-IT" : "fr-FR",
                      { year: "numeric", month: "short", day: "numeric" }
                    )}
                  </time>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
