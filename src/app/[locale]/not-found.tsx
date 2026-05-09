import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <p
        className="text-xs font-mono font-semibold tracking-widest uppercase mb-4"
        style={{ color: "var(--accent)" }}
      >
        404
      </p>
      <h1
        className="text-3xl font-mono font-bold mb-3"
        style={{ color: "var(--foreground)" }}
      >
        {t("title")}
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
        {t("subtitle")}
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-mono border px-4 py-2 rounded-lg transition-opacity hover:opacity-70"
        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        {t("back")}
      </Link>
    </div>
  );
}
