import { routing } from "@/i18n/routing";

export type AppLocale = "fr" | "en" | "it";

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export const OG_LOCALES: Record<AppLocale, string> = {
  fr: "fr_FR",
  en: "en_US",
  it: "it_IT",
};

export function buildLanguageAlternates(pathWithinLocale: string): Record<string, string> {
  const site = getSiteUrl();
  const clean = pathWithinLocale.startsWith("/") ? pathWithinLocale : `/${pathWithinLocale}`;
  const out: Record<string, string> = {};
  for (const l of routing.locales) {
    out[l] = `${site}/${l}${clean === "/" ? "" : clean}`;
  }
  out["x-default"] = `${site}/${routing.defaultLocale}${clean === "/" ? "" : clean}`;
  return out;
}

export function localizedPath(locale: AppLocale, pathWithinLocale: string): string {
  const clean = pathWithinLocale.startsWith("/") ? pathWithinLocale : `/${pathWithinLocale}`;
  return `${getSiteUrl()}/${locale}${clean === "/" ? "" : clean}`;
}

export function pickLocaleField<T>(
  locale: AppLocale,
  fields: { fr: T; en: T; it: T }
): T {
  return fields[locale];
}

export const SITE_NAME = "Portfolio";

/**
 * Identité canonique pour le référencement (SEO / Knowledge Graph Google).
 *
 * CANONICAL_NAME est le nom principal que l'on veut voir ressortir dans les
 * recherches Google. NAME_ALTERNATES regroupe toutes les autres formes du nom
 * et pseudonymes utilisés sur les différentes plateformes, afin que Google les
 * relie à une seule et même personne (schema.org `alternateName`).
 */
export const CANONICAL_NAME = "Djouaka Kelefack Lionel";

export const NAME_ALTERNATES = [
  "Lionel Djouaka Kelefack",
  "Lionel Djouaka",
  "Djouaka Lionel",
  "Kelenixdev",
];

/** Formes de nom à injecter dans les mots-clés / balises meta. */
export const NAME_KEYWORDS = [CANONICAL_NAME, ...NAME_ALTERNATES];

export const GIVEN_NAME = "Lionel";
export const FAMILY_NAME = "Djouaka Kelefack";

/** Page développeur Google Play (pseudonyme Kelenixdev). */
export const PLAY_STORE_DEVELOPER_URL =
  "https://play.google.com/store/apps/developer?id=Kelenixdev";

/** Profils publics reliés à l'identité (schema.org `sameAs`). */
export const CANONICAL_SAME_AS = [
  "https://www.linkedin.com/in/lioneldjouaka/",
  PLAY_STORE_DEVELOPER_URL,
];

export const PERSON_NATIONALITY = "Cameroonian";

export const PERSON_ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Ancona",
  addressRegion: "Marche",
  addressCountry: "IT",
} as const;

export const PERSON_ALUMNI_OF = {
  "@type": "CollegeOrUniversity",
  name: "Università Politecnica delle Marche",
} as const;
