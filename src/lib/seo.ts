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
