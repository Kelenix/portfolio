import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { type AppLocale, pickLocaleField } from "@/lib/seo";

export const alt = "Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const dynamic = "force-dynamic";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = (localeParam as AppLocale) ?? "fr";

  let profile = null;
  try {
    profile = await prisma.profile.findFirst({ where: { id: "default" } });
  } catch {
    /* DB unavailable — fall back to defaults below */
  }

  const fallbackByLocale = {
    fr: { name: "Portfolio", role: "Développeur Fullstack" },
    en: { name: "Portfolio", role: "Fullstack Developer" },
    it: { name: "Portfolio", role: "Sviluppatore Fullstack" },
  } as const;

  const name = profile
    ? pickLocaleField(locale, {
        fr: profile.nameFr || fallbackByLocale.fr.name,
        en: profile.nameEn || fallbackByLocale.en.name,
        it: profile.nameIt || fallbackByLocale.it.name,
      })
    : fallbackByLocale[locale].name;

  const role = profile
    ? pickLocaleField(locale, {
        fr: profile.roleFr || fallbackByLocale.fr.role,
        en: profile.roleEn || fallbackByLocale.en.role,
        it: profile.roleIt || fallbackByLocale.it.role,
      })
    : fallbackByLocale[locale].role;

  const ctaLabel =
    locale === "en" ? "View portfolio" : locale === "it" ? "Vedi portfolio" : "Voir le portfolio";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          color: "#fafafa",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            opacity: 0.6,
            marginBottom: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Portfolio · {locale.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 28,
            letterSpacing: "-0.02em",
          }}
        >
          {name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            opacity: 0.75,
            lineHeight: 1.3,
          }}
        >
          {role}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            opacity: 0.45,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <span>{ctaLabel}</span>
          <span>→</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
