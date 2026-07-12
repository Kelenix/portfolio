import { getLocale, getTranslations } from "next-intl/server";
import Script from "next/script";
import type { AppLocale } from "@/lib/seo";
import { getChariowProducts } from "@/lib/chariow";
import { type FormationCard } from "@/components/sections/FormationsGrid";
import { FormationsShowcase } from "@/components/sections/FormationsShowcase";
import type { Metadata } from "next";

export const revalidate = 600;

// Ordre des catégories (par type de produit Chariow).
const CATEGORY_ORDER = ["downloadable", "coaching", "course", "service", "license", "bundle"] as const;

// Libellés des catégories selon la langue (étiquette carte + filtre).
const LABELS: Record<AppLocale, Record<string, string>> = {
  fr: { downloadable: "eBook", coaching: "Coaching", course: "Vidéo", service: "Service", license: "Licence", bundle: "Pack", other: "Autre" },
  en: { downloadable: "eBook", coaching: "Coaching", course: "Video", service: "Service", license: "License", bundle: "Bundle", other: "Other" },
  it: { downloadable: "eBook", coaching: "Coaching", course: "Video", service: "Servizio", license: "Licenza", bundle: "Pacchetto", other: "Altro" },
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("courses");
  return { title: t("catalogTitle"), description: t("catalogSubtitle") };
}

export default async function CoursesPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("courses");

  const { products, error } = await getChariowProducts();
  const labels = LABELS[locale] ?? LABELS.fr;
  const order = CATEGORY_ORDER as readonly string[];

  const items: FormationCard[] = products.map((p) => {
    const category = order.includes(p.type) ? p.type : "other";
    return {
      name: p.name,
      thumbnail: p.thumbnail,
      price: p.price,
      original: p.original,
      isFree: p.isFree,
      url: p.url,
      category,
      badge: labels[category] ?? labels.other,
    };
  });

  // Catégories réellement présentes, dans l'ordre défini (+ « Autre » à la fin).
  const present = new Set(items.map((i) => i.category));
  const categories = [...CATEGORY_ORDER, "other"]
    .filter((k) => present.has(k))
    .map((k) => ({ key: k, label: labels[k] }));

  // Données structurées : liste de produits avec offres (rich results Google).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        ...(p.thumbnail ? { image: p.thumbnail } : {}),
        url: p.url,
        ...(p.priceValue != null && p.currency
          ? {
              offers: {
                "@type": "Offer",
                price: p.priceValue,
                priceCurrency: p.currency,
                availability: "https://schema.org/InStock",
                url: p.url,
              },
            }
          : {}),
      },
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {items.length > 0 && (
        <Script
          id="courses-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <h1 className="mb-3 font-mono text-2xl font-bold" style={{ color: "var(--foreground)" }}>
        {t("catalogTitle")}
      </h1>
      <p className="mb-10 text-sm" style={{ color: "var(--muted-foreground)" }}>
        {t("catalogSubtitle")}
      </p>

      {items.length > 0 ? (
        <FormationsShowcase
          items={items}
          categories={categories}
          allLabel={t("all")}
          cta={t("viewOn")}
          freeLabel={t("free")}
        />
      ) : (
        <p className="font-mono text-sm" style={{ color: "var(--muted-foreground)" }}>
          {error ? t("error") : t("empty")}
        </p>
      )}
    </div>
  );
}
