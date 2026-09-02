import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import {
  type AppLocale,
  buildLanguageAlternates,
  localizedPath,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const TITLE = "Docker + IA · De Zéro à Pro";
const DESCRIPTION =
  "Formation Docker + IA : de zéro à pro. Maîtrise la conteneurisation et l'IA appliquée, étape par étape.";

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
    },
  };
}

export default function CoachingPage() {
  return (
    <iframe
      src="/coaching/docker-ia.html"
      title={TITLE}
      className="block w-full border-0"
      style={{ height: "calc(100dvh - 64px)" }}
    />
  );
}
