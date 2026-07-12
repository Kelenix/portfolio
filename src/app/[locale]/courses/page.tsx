import { getLocale, getTranslations } from "next-intl/server";
import type { AppLocale } from "@/lib/seo";
import { getChariowProducts } from "@/lib/chariow";
import { FormationsGrid, type FormationCard } from "@/components/sections/FormationsGrid";
import type { Metadata } from "next";

export const revalidate = 600;

// Libellé du type de produit selon la langue.
const TYPE_LABELS: Record<AppLocale, Record<string, string>> = {
  fr: { downloadable: "eBook", course: "Cours", coaching: "Coaching", service: "Service", license: "Licence", bundle: "Pack" },
  en: { downloadable: "eBook", course: "Course", coaching: "Coaching", service: "Service", license: "License", bundle: "Bundle" },
  it: { downloadable: "eBook", course: "Corso", coaching: "Coaching", service: "Servizio", license: "Licenza", bundle: "Pacchetto" },
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("courses");
  return { title: t("catalogTitle"), description: t("catalogSubtitle") };
}

export default async function CoursesPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("courses");

  const products = await getChariowProducts();
  const labels = TYPE_LABELS[locale] ?? TYPE_LABELS.fr;

  const items: FormationCard[] = products.map((p) => ({
    name: p.name,
    thumbnail: p.thumbnail,
    price: p.price,
    original: p.original,
    isFree: p.isFree,
    badge: labels[p.type] ?? null,
    url: p.url,
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-3 font-mono text-2xl font-bold" style={{ color: "var(--foreground)" }}>
        {t("catalogTitle")}
      </h1>
      <p className="mb-12 text-sm" style={{ color: "var(--muted-foreground)" }}>
        {t("catalogSubtitle")}
      </p>

      {items.length > 0 ? (
        <FormationsGrid items={items} cta={t("viewOn")} freeLabel={t("free")} />
      ) : (
        <p className="font-mono text-sm" style={{ color: "var(--muted-foreground)" }}>
          {t("empty")}
        </p>
      )}
    </div>
  );
}
