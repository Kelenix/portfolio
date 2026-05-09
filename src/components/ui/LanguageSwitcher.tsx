"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const locales = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "it", label: "IT" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1">
      {locales.map(({ code, label }, i) => (
        <span key={code} className="flex items-center gap-1">
          <button
            onClick={() => handleChange(code)}
            className="text-xs font-mono transition-opacity"
            style={{
              color: locale === code ? "var(--foreground)" : "var(--muted-foreground)",
              opacity: locale === code ? 1 : 0.6,
              fontWeight: locale === code ? "600" : "400",
            }}
          >
            {label}
          </button>
          {i < locales.length - 1 && (
            <span className="text-xs" style={{ color: "var(--border)" }}>|</span>
          )}
        </span>
      ))}
    </div>
  );
}
