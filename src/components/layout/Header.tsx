"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "var(--background)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-wider hover:opacity-70 transition-opacity"
          style={{ color: "var(--foreground)" }}
        >
          PORTFOLIO.DEV
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/blog"
            className="text-sm transition-opacity hover:opacity-70"
            style={{
              color: isActive("/blog") ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            {t("blog")}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: "var(--foreground)" }}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-4 flex flex-col gap-4 border-t"
          style={{ borderColor: "var(--border)", background: "var(--background)" }}
        >
          <Link
            href="/blog"
            className="text-sm py-2"
            style={{ color: "var(--muted-foreground)" }}
            onClick={() => setMenuOpen(false)}
          >
            {t("blog")}
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
