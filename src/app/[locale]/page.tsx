import { prisma } from "@/lib/db";
import { getLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { Accomplishments } from "@/components/sections/Accomplishments";
import { Projects } from "@/components/sections/Projects";
import { TechStack } from "@/components/sections/TechStack";
import { Contact } from "@/components/sections/Contact";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Portfolio",
    alternates: {
      canonical: "/",
    },
  };
}

export default async function HomePage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const isIt = locale === "it";

  const [profile, socials, accomplishments, projects, skills] = await Promise.all([
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
    socials: socials.map((s) => ({ platform: s.platform, url: s.url })),
  };

  const accomplishmentItems = accomplishments.map((a) => ({
    id: a.id,
    text: isEn ? a.textEn : isIt ? a.textIt : a.textFr,
    link: a.link,
    linkLabel: a.linkLabel,
  }));

  const projectItems = projects.map((p) => ({
    id: p.id,
    title: isEn ? p.titleEn : isIt ? p.titleIt : p.titleFr,
    desc: isEn ? p.descEn : isIt ? p.descIt : p.descFr,
    url: p.url,
    github: p.github,
    tags: p.tags,
  }));

  return (
    <>
      <Hero profile={profileData} />
      <Accomplishments items={accomplishmentItems} />
      <Projects items={projectItems} />
      <TechStack skills={skills} />
      <Contact email={profileData.email} />
    </>
  );
}
