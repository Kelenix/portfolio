import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";

type FooterLinkRecord = {
  id: string;
  labelFr: string;
  labelEn: string;
  labelIt: string;
  url: string;
  column: string;
};

async function getFooterLinks(): Promise<FooterLinkRecord[]> {
  try {
    return await prisma.footerLink.findMany({
      where: { published: true },
      orderBy: [{ column: "asc" }, { order: "asc" }],
      select: {
        id: true,
        labelFr: true,
        labelEn: true,
        labelIt: true,
        url: true,
        column: true,
      },
    });
  } catch {
    return [];
  }
}

export async function Footer() {
  const t = await getTranslations("footer");
  const locale = await getLocale();
  const links = await getFooterLinks();
  const year = new Date().getFullYear();

  const getLabel = (l: FooterLinkRecord) =>
    locale === "en" ? l.labelEn : locale === "it" ? l.labelIt : l.labelFr;

  const formations = links.filter((l) => l.column === "formations");
  const products = links.filter((l) => l.column === "products");
  const hasAnyColumn = formations.length > 0 || products.length > 0;

  const isExternal = (url: string) => /^https?:\/\//i.test(url);

  const renderLink = (l: FooterLinkRecord) => {
    const label = getLabel(l);
    if (isExternal(l.url)) {
      return (
        <a
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm transition-all duration-200 hover:underline"
          style={{ color: "var(--muted-foreground)" }}
        >
          {label}
        </a>
      );
    }
    return (
      <Link
        href={l.url}
        className="text-sm transition-all duration-200 hover:underline"
        style={{ color: "var(--muted-foreground)" }}
      >
        {label}
      </Link>
    );
  };

  return (
    <footer
      className="border-t mt-16"
      style={{ borderColor: "var(--border)", background: "var(--muted)" }}
    >
      <div className="mx-auto max-w-5xl px-6 py-10">
        {hasAnyColumn && (
          <div className="grid grid-cols-2 gap-8 mb-8">
            {formations.length > 0 && (
              <div>
                <p
                  className="text-xs font-mono font-semibold tracking-wider mb-4 uppercase"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {t("formations")}
                </p>
                <ul className="space-y-2">
                  {formations.map((l) => (
                    <li key={l.id}>{renderLink(l)}</li>
                  ))}
                </ul>
              </div>
            )}
            {products.length > 0 && (
              <div>
                <p
                  className="text-xs font-mono font-semibold tracking-wider mb-4 uppercase"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {t("products")}
                </p>
                <ul className="space-y-2">
                  {products.map((l) => (
                    <li key={l.id}>{renderLink(l)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div
          className="border-t pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
            © {year} Portfolio. {t("copyright")}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/legal"
              className="text-xs hover:underline transition-all"
              style={{ color: "var(--muted-foreground)" }}
            >
              {t("legal")}
            </Link>
            <Link
              href="/privacy"
              className="text-xs hover:underline transition-all"
              style={{ color: "var(--muted-foreground)" }}
            >
              {t("privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
