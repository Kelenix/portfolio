import { getLocale, getTranslations } from "next-intl/server";
import type { AppLocale } from "@/lib/seo";
import { getChariowProducts, type ChariowProduct } from "@/lib/chariow";
import { FormationsGrid, type FormationCard } from "@/components/sections/FormationsGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Metadata } from "next";

export const revalidate = 600;

// Ordre d'affichage des catégories (par type de produit Chariow).
const GROUP_ORDER = ["downloadable", "coaching", "course", "service", "license", "bundle"] as const;

// Libellés des catégories selon la langue.
const GROUP_LABELS: Record<AppLocale, Record<string, string>> = {
  fr: { downloadable: "eBooks", coaching: "Coaching", course: "Formations vidéo", service: "Services", license: "Licences", bundle: "Packs", other: "Autres" },
  en: { downloadable: "eBooks", coaching: "Coaching", course: "Video courses", service: "Services", license: "Licenses", bundle: "Bundles", other: "Others" },
  it: { downloadable: "eBook", coaching: "Coaching", course: "Corsi video", service: "Servizi", license: "Licenze", bundle: "Pacchetti", other: "Altri" },
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("courses");
  return { title: t("catalogTitle"), description: t("catalogSubtitle") };
}

const toCard = (p: ChariowProduct): FormationCard => ({
  name: p.name,
  thumbnail: p.thumbnail,
  price: p.price,
  original: p.original,
  isFree: p.isFree,
  badge: null, // la catégorie est portée par le titre du groupe
  url: p.url,
});

export default async function CoursesPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("courses");

  const products = await getChariowProducts();
  const labels = GROUP_LABELS[locale] ?? GROUP_LABELS.fr;

  // Regroupe par type, dans l'ordre défini ; les types inconnus vont dans « Autres ».
  const groups: { key: string; label: string; items: FormationCard[] }[] = GROUP_ORDER.map(
    (type) => ({
      key: type,
      label: labels[type],
      items: products.filter((p) => p.type === type).map(toCard),
    })
  ).filter((g) => g.items.length > 0);

  const others = products
    .filter((p) => !GROUP_ORDER.includes(p.type as (typeof GROUP_ORDER)[number]))
    .map(toCard);
  if (others.length > 0) {
    groups.push({ key: "other", label: labels.other, items: others });
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-3 font-mono text-2xl font-bold" style={{ color: "var(--foreground)" }}>
        {t("catalogTitle")}
      </h1>
      <p className="mb-12 text-sm" style={{ color: "var(--muted-foreground)" }}>
        {t("catalogSubtitle")}
      </p>

      {groups.length > 0 ? (
        <div className="space-y-14">
          {groups.map((g) => (
            <section key={g.key}>
              <SectionHeading>{g.label}</SectionHeading>
              <FormationsGrid items={g.items} cta={t("viewOn")} freeLabel={t("free")} />
            </section>
          ))}
        </div>
      ) : (
        <p className="font-mono text-sm" style={{ color: "var(--muted-foreground)" }}>
          {t("empty")}
        </p>
      )}
    </div>
  );
}
