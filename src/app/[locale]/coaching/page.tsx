import type { Metadata } from "next";
import { CoachingLanding } from "@/components/sections/CoachingLanding";
import { getLocale } from "next-intl/server";
import {
  type AppLocale,
  buildLanguageAlternates,
  localizedPath,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const TITLE = "Coaching : Lance ton site web avec l'IA en 2 semaines";
const DESCRIPTION =
  "Un accompagnement pas à pas pour transformer ton idée en un vrai site web en ligne grâce à l'IA — en 2 semaines, même en partant de zéro.";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as AppLocale;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: localizedPath(locale, "/coaching"),
      languages: buildLanguageAlternates("/coaching"),
    },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      images: ["/coaching/cover.png"],
    },
  };
}

export default function CoachingPage() {
  return <CoachingLanding />;
}
