import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/db";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import {
  type AppLocale,
  OG_LOCALES,
  SITE_NAME,
  buildLanguageAlternates,
  getSiteUrl,
  localizedPath,
  pickLocaleField,
} from "@/lib/seo";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });

  let profile = null;
  try {
    profile = await prisma.profile.findFirst({ where: { id: "default" } });
  } catch {
    /* ignore — DB unavailable during certain build steps */
  }

  const l = (locale as AppLocale) ?? "fr";
  const name = profile
    ? pickLocaleField(l, {
        fr: profile.nameFr || SITE_NAME,
        en: profile.nameEn || SITE_NAME,
        it: profile.nameIt || SITE_NAME,
      })
    : SITE_NAME;
  const role = profile
    ? pickLocaleField(l, {
        fr: profile.roleFr || t("role"),
        en: profile.roleEn || t("role"),
        it: profile.roleIt || t("role"),
      })
    : t("role");
  const bio = profile
    ? pickLocaleField(l, {
        fr: profile.bioFr || t("bio"),
        en: profile.bioEn || t("bio"),
        it: profile.bioIt || t("bio"),
      })
    : t("bio");

  const title = `${name} — ${role}`;
  const url = localizedPath(l, "/");
  const ogLocale = OG_LOCALES[l] ?? OG_LOCALES.fr;

  return {
    title: {
      template: `%s | ${name}`,
      default: title,
    },
    description: bio,
    keywords: [
      name,
      role,
      "portfolio",
      "fullstack",
      "developer",
      "développeur",
      "Next.js",
      "TypeScript",
      "React",
    ],
    authors: [{ name }],
    creator: name,
    publisher: name,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates("/"),
    },
    openGraph: {
      type: "website",
      title,
      description: bio,
      url,
      siteName: name,
      locale: ogLocale,
      alternateLocale: Object.values(OG_LOCALES).filter((x) => x !== ogLocale),
      images: [
        {
          url: profile?.photoUrl || `${getSiteUrl()}/${l}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: bio,
      images: [profile?.photoUrl || `${getSiteUrl()}/${l}/opengraph-image`],
      creator: name,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const [messages, chatProfile] = await Promise.all([
    getMessages(),
    (async () => {
      try {
        const p = await prisma.profile.findFirst({ where: { id: "default" } });
        return {
          avatarUrl: p?.photoUrl ?? null,
          name: p
            ? pickLocaleField(locale as AppLocale, {
                fr: p.nameFr,
                en: p.nameEn,
                it: p.nameIt,
              })
            : null,
        };
      } catch {
        return { avatarUrl: null, name: null };
      }
    })(),
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <div
          className="flex min-h-screen flex-col"
          style={{ background: "var(--background)", color: "var(--foreground)" }}
        >
          <Header locale={locale} />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWidget avatarUrl={chatProfile.avatarUrl} adminName={chatProfile.name} />
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
