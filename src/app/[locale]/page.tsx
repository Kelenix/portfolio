import { prisma } from "@/lib/db";
import { getLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { Accomplishments } from "@/components/sections/Accomplishments";
import { Projects } from "@/components/sections/Projects";
import { MobileApps } from "@/components/sections/MobileApps";
import { TechStack } from "@/components/sections/TechStack";
import { Contact } from "@/components/sections/Contact";
import {
  type AppLocale,
  buildLanguageAlternates,
  getSiteUrl,
  localizedPath,
} from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as AppLocale;
  return {
    alternates: {
      canonical: localizedPath(locale, "/"),
      languages: buildLanguageAlternates("/"),
    },
  };
}

export default async function HomePage() {
  const locale = (await getLocale()) as AppLocale;
  const isEn = locale === "en";
  const isIt = locale === "it";

  const [profile, socials, accomplishments, projects, mobileApps, skills] = await Promise.all([
    prisma.profile.findFirst({ where: { id: "default" } }),
    prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
    prisma.accomplishment.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    }),
    prisma.project.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    }),
    prisma.mobileApp.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    }),
    prisma.skill.findMany({
      where: { published: true },
      orderBy: [{ category: "asc" }, { order: "asc" }],
    }),
  ]);

  const profileData = {
    name: isEn
      ? (profile?.nameEn ?? "Your Name")
      : isIt
        ? (profile?.nameIt ?? "Il Tuo Nome")
        : (profile?.nameFr ?? "Votre Nom"),
    role: isEn
      ? (profile?.roleEn ?? "")
      : isIt
        ? (profile?.roleIt ?? "")
        : (profile?.roleFr ?? ""),
    bio: isEn
      ? (profile?.bioEn ?? "")
      : isIt
        ? (profile?.bioIt ?? "")
        : (profile?.bioFr ?? ""),
    email: profile?.email ?? "contact@example.com",
    photoUrl: profile?.photoUrl,
    socials: socials.map((s) => ({ id: s.id, platform: s.platform, url: s.url })),
  };

  const accomplishmentItems = accomplishments.map((a) => ({
    id: a.id,
    text: isEn ? a.textEn : isIt ? a.textIt : a.textFr,
    link: a.link,
    linkLabel: isEn
      ? (a.linkLabelEn || a.linkLabel)
      : isIt
        ? (a.linkLabelIt || a.linkLabel)
        : a.linkLabel,
  }));

  const projectItems = projects.map((p) => ({
    id: p.id,
    title: isEn ? p.titleEn : isIt ? p.titleIt : p.titleFr,
    desc: isEn ? p.descEn : isIt ? p.descIt : p.descFr,
    url: p.url,
    github: p.github,
    tags: p.tags,
  }));

  const mobileAppItems = mobileApps.map((a) => ({
    id: a.id,
    name: a.name,
    desc: isEn ? a.descEn : isIt ? a.descIt : a.descFr,
    iconUrl: a.iconUrl,
    playStoreUrl: a.playStoreUrl,
    appStoreUrl: a.appStoreUrl,
  }));

  const siteUrl = getSiteUrl();
  const homeUrl = localizedPath(locale, "/");

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profileData.name,
    jobTitle: profileData.role,
    description: profileData.bio,
    email: profileData.email ? `mailto:${profileData.email}` : undefined,
    image: profileData.photoUrl || undefined,
    url: homeUrl,
    sameAs: profileData.socials.map((s) => s.url),
    knowsAbout: skills.map((s) => s.name),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: profileData.name,
    url: siteUrl,
    inLanguage: locale,
    author: { "@type": "Person", name: profileData.name },
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Hero profile={profileData} />
      <Accomplishments items={accomplishmentItems} />
      <Projects items={projectItems} />
      <MobileApps items={mobileAppItems} />
      <TechStack skills={skills} />
      <Contact email={profileData.email} />
    </>
  );
}
