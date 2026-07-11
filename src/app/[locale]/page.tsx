import { prisma } from "@/lib/db";
import { getLocale } from "next-intl/server";
import Script from "next/script";
import { Hero } from "@/components/sections/Hero";
import { InteractiveDesk } from "@/components/three/InteractiveDesk";
import type { DeskLinks } from "@/components/three/links";
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
  CANONICAL_NAME,
  NAME_ALTERNATES,
  GIVEN_NAME,
  FAMILY_NAME,
  CANONICAL_SAME_AS,
  PERSON_NATIONALITY,
  PERSON_ADDRESS,
  PERSON_ALUMNI_OF,
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

  // Chaque requête a son propre fallback : si la base est injoignable, la page
  // s'affiche quand même (sections vides) au lieu de renvoyer une 500.
  const [profile, socials, accomplishments, projects, mobileApps, skills] = await Promise.all([
    prisma.profile.findFirst({ where: { id: "default" } }).catch(() => null),
    prisma.socialLink.findMany({ orderBy: { order: "asc" } }).catch(() => []),
    prisma.accomplishment
      .findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      })
      .catch(() => []),
    prisma.project
      .findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      })
      .catch(() => []),
    prisma.mobileApp
      .findMany({
        where: { published: true },
        orderBy: { order: "asc" },
      })
      .catch(() => []),
    prisma.skill
      .findMany({
        where: { published: true },
        orderBy: [{ category: "asc" }, { order: "asc" }],
      })
      .catch(() => []),
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
    imageUrl: p.imageUrl,
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

  // Liens des objets cliquables du bureau 3D, construits depuis la vraie data.
  const deskLabels = (
    {
      fr: { monitor: "Projets", phone: "Applications", books: "Coaching", mug: "Me contacter" },
      en: { monitor: "Projects", phone: "Apps", books: "Coaching", mug: "Contact me" },
      it: { monitor: "Progetti", phone: "App", books: "Coaching", mug: "Contattami" },
    } as const
  )[isEn ? "en" : isIt ? "it" : "fr"];

  const githubSocial = profileData.socials.find(
    (s) => s.platform.toLowerCase() === "github"
  );

  const deskLinks: DeskLinks = {
    ...(projectItems.length > 0 && {
      monitor: { label: deskLabels.monitor, kind: "anchor", href: "projets" },
    }),
    ...(mobileAppItems.length > 0 && {
      phone: { label: deskLabels.phone, kind: "anchor", href: "apps" },
    }),
    books: { label: deskLabels.books, kind: "route", href: localizedPath(locale, "/coaching") },
    mug: { label: deskLabels.mug, kind: "anchor", href: "contact" },
    ...(githubSocial && {
      plant: { label: "GitHub", kind: "external", href: githubSocial.url },
    }),
  };

  const siteUrl = getSiteUrl();
  const homeUrl = localizedPath(locale, "/");

  // Toutes les formes du nom, sans doublon, pour relier les identités entre
  // elles dans le Knowledge Graph de Google (alternateName).
  const alternateNames = Array.from(
    new Set([...NAME_ALTERNATES, profileData.name].filter(Boolean))
  ).filter((n) => n !== CANONICAL_NAME);

  // sameAs = liens vers les profils publics (réseaux du profil + liens
  // canoniques comme LinkedIn / page développeur Google Play), sans doublon.
  const sameAs = Array.from(
    new Set([...profileData.socials.map((s) => s.url), ...CANONICAL_SAME_AS])
  );

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: CANONICAL_NAME,
    alternateName: alternateNames,
    givenName: GIVEN_NAME,
    familyName: FAMILY_NAME,
    jobTitle: profileData.role,
    description: profileData.bio,
    email: profileData.email ? `mailto:${profileData.email}` : undefined,
    image: profileData.photoUrl || undefined,
    url: homeUrl,
    nationality: PERSON_NATIONALITY,
    address: PERSON_ADDRESS,
    alumniOf: PERSON_ALUMNI_OF,
    sameAs,
    knowsAbout: skills.map((s) => s.name),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: CANONICAL_NAME,
    url: siteUrl,
    inLanguage: locale,
    author: { "@type": "Person", name: CANONICAL_NAME },
  };

  return (
    <>
      <Script
        id="person-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Script
        id="website-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Hero profile={profileData} />
      <InteractiveDesk links={deskLinks} />
      <Accomplishments items={accomplishmentItems} />
      <Projects items={projectItems} />
      <MobileApps items={mobileAppItems} />
      <TechStack skills={skills} />
      <Contact email={profileData.email} />
    </>
  );
}
