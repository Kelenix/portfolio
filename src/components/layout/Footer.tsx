"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t mt-24"
      style={{ borderColor: "var(--border)", background: "var(--muted)" }}
    >
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p
              className="text-xs font-mono font-semibold tracking-wider mb-4 uppercase"
              style={{ color: "var(--muted-foreground)" }}
            >
              {t("formations")}
            </p>
            <ul className="space-y-2">
              {[
                { label: "Next.js Mastery", href: "#" },
                { label: "TypeScript Pro", href: "#" },
                { label: "Design System", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm transition-all duration-200 hover:underline"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p
              className="text-xs font-mono font-semibold tracking-wider mb-4 uppercase"
              style={{ color: "var(--muted-foreground)" }}
            >
              {t("products")}
            </p>
            <ul className="space-y-2">
              {[
                { label: "SaaS Starter Kit", href: "#" },
                { label: "CLI Tools", href: "#" },
                { label: "Component Library", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm transition-all duration-200 hover:underline"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="border-t pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
            © {year} Portfolio. {t("copyright")}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs hover:underline transition-all"
              style={{ color: "var(--muted-foreground)" }}
            >
              {t("legal")}
            </Link>
            <Link
              href="/"
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
