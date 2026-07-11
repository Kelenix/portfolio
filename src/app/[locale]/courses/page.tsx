import { getLocale, getTranslations } from "next-intl/server";
import { pickLocaleField, type AppLocale } from "@/lib/seo";
import { CoursesGrid, type CoursePlatform } from "@/components/sections/CoursesGrid";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// ===========================================================================
// Configure ici tes plateformes de formation.
// - href : URL externe de la plateforme (null => carte désactivée « bientôt »).
// - badge : petit label optionnel (ex. « bientôt », « nouveau »).
// - disabled : true pour afficher la carte grisée et non cliquable.
// ===========================================================================
type PlatformConfig = {
  href: string | null;
  titleFr: string;
  titleEn: string;
  titleIt: string;
  descFr: string;
  descEn: string;
  descIt: string;
  badge?: string;
  disabled?: boolean;
};

const PLATFORMS: PlatformConfig[] = [
  {
    href: null,
    titleFr: "Plateforme n°1",
    titleEn: "Platform 1",
    titleIt: "Piattaforma 1",
    descFr: "Bientôt disponible. Renseigne l'URL dans src/app/[locale]/courses/page.tsx.",
    descEn: "Coming soon. Set the URL in src/app/[locale]/courses/page.tsx.",
    descIt: "Presto disponibile. Imposta l'URL in src/app/[locale]/courses/page.tsx.",
    badge: "bientôt",
    disabled: true,
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("courses");
  return { title: t("catalogTitle"), description: t("catalogSubtitle") };
}

export default async function CoursesPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("courses");

  const items: CoursePlatform[] = PLATFORMS.map((p) => ({
    href: p.href,
    title: pickLocaleField(locale, { fr: p.titleFr, en: p.titleEn, it: p.titleIt }),
    desc: pickLocaleField(locale, { fr: p.descFr, en: p.descEn, it: p.descIt }),
    badge: p.badge,
    disabled: p.disabled,
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-3 font-mono text-2xl font-bold" style={{ color: "var(--foreground)" }}>
        {t("catalogTitle")}
      </h1>
      <p className="mb-12 text-sm" style={{ color: "var(--muted-foreground)" }}>
        {t("catalogSubtitle")}
      </p>

      <CoursesGrid items={items} />
    </div>
  );
}
