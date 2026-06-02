import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/db";
import { getSiteUrl } from "@/lib/seo";

const STATIC_ROUTES = ["", "/blog", "/legal", "/privacy"] as const;

function alternates(path: string, baseUrl: string): { languages: Record<string, string> } {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${baseUrl}/${l}${path === "" ? "" : path}`;
  }
  languages["x-default"] = `${baseUrl}/${routing.defaultLocale}${path === "" ? "" : path}`;
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const route of STATIC_ROUTES) {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: now,
        changeFrequency: route === "" ? "weekly" : route === "/blog" ? "weekly" : "yearly",
        priority: route === "" ? 1.0 : route === "/blog" ? 0.7 : 0.3,
        alternates: alternates(route, baseUrl),
      });
    }
  }

  let posts: Array<{ slug: string; updatedAt: Date; publishedAt: Date | null }> = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
    });
  } catch {
    /* DB may be unavailable during certain build steps */
  }

  for (const post of posts) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: alternates(`/blog/${post.slug}`, baseUrl),
      });
    }
  }

  return entries;
}
