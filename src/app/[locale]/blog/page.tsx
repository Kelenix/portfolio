import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blog");
  return { title: t("title") };
}

export default async function BlogPage() {
  const t = await getTranslations("blog");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1
        className="text-2xl font-mono font-bold mb-3"
        style={{ color: "var(--foreground)" }}
      >
        {t("title")}
      </h1>
      <p className="text-sm mb-12" style={{ color: "var(--muted-foreground)" }}>
        {t("subtitle")}
      </p>
      <p
        className="text-sm font-mono"
        style={{ color: "var(--muted-foreground)" }}
      >
        {t("empty")}
      </p>
    </div>
  );
}
