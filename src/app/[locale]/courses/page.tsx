import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { pickLocaleField, type AppLocale } from "@/lib/seo";
import { CoursesGrid, type CoursePlatform } from "@/components/sections/CoursesGrid";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("courses");
  return { title: t("catalogTitle"), description: t("catalogSubtitle") };
}

export default async function CoursesPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("courses");

  // Résilient : liste vide si la table n'existe pas encore ou DB injoignable.
  const platforms = await prisma.platform
    .findMany({ where: { published: true }, orderBy: { order: "asc" } })
    .catch(() => []);

  const items: CoursePlatform[] = platforms.map((p) => ({
    href: p.url,
    title: p.title,
    desc: pickLocaleField(locale, { fr: p.descFr, en: p.descEn, it: p.descIt }),
    badge: p.badge ?? undefined,
    disabled: !p.url,
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-3 font-mono text-2xl font-bold" style={{ color: "var(--foreground)" }}>
        {t("catalogTitle")}
      </h1>
      <p className="mb-12 text-sm" style={{ color: "var(--muted-foreground)" }}>
        {t("catalogSubtitle")}
      </p>

      {items.length > 0 ? (
        <CoursesGrid items={items} />
      ) : (
        <p className="font-mono text-sm" style={{ color: "var(--muted-foreground)" }}>
          {t("empty")}
        </p>
      )}
    </div>
  );
}
