import { getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// À remplacer par tes vraies plateformes quand elles seront prêtes.
// Chaque entrée pointe vers un nom de domaine externe.
type Platform = {
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

const platforms: Platform[] = [
  {
    href: null,
    titleFr: "Plateforme n°1",
    titleEn: "Platform 1",
    titleIt: "Piattaforma 1",
    descFr: "Bientôt disponible. Configure l'URL dans src/app/[locale]/courses/page.tsx.",
    descEn: "Coming soon. Configure the URL in src/app/[locale]/courses/page.tsx.",
    descIt: "Presto disponibile. Configura l'URL in src/app/[locale]/courses/page.tsx.",
    badge: "bientôt",
    disabled: true,
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("courses");
  return { title: t("catalogTitle"), description: t("catalogSubtitle") };
}

export default async function CoursesPage() {
  const t = await getTranslations("courses");

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1
        className="text-2xl font-mono font-bold mb-3"
        style={{ color: "var(--foreground)" }}
      >
        {t("catalogTitle")}
      </h1>
      <p className="text-sm mb-12" style={{ color: "var(--muted-foreground)" }}>
        {t("catalogSubtitle")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platforms.map((p, i) => {
          const title = p.titleFr;
          const desc = p.descFr;
          const cardContent = (
            <>
              <div className="flex items-start justify-between gap-3 mb-3">
                <p
                  className="text-sm font-mono font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {title}
                </p>
                {p.badge ? (
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {p.badge}
                  </span>
                ) : (
                  <ExternalLink
                    size={14}
                    strokeWidth={1.5}
                    style={{ color: "var(--muted-foreground)" }}
                    className="shrink-0"
                  />
                )}
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--muted-foreground)" }}
              >
                {desc}
              </p>
            </>
          );

          const styles = {
            background: "var(--muted)",
            borderColor: "var(--border)",
          };

          if (p.disabled || !p.href) {
            return (
              <div
                key={i}
                className="block p-5 rounded-lg border opacity-70"
                style={styles}
                aria-disabled
              >
                {cardContent}
              </div>
            );
          }

          return (
            <a
              key={i}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-5 rounded-lg border transition-opacity hover:opacity-80"
              style={styles}
            >
              {cardContent}
            </a>
          );
        })}
      </div>
    </div>
  );
}
