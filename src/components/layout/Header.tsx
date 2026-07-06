"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { GraduationCap, Menu, MessageCircle, Rocket, X } from "lucide-react";
import { useState, useEffect } from "react";
import { OPEN_CHAT_EVENT, UNREAD_CHAT_EVENT } from "@/components/chat/ChatWidget";

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ count: number }>).detail;
      setChatUnread(detail?.count ?? 0);
    };
    window.addEventListener(UNREAD_CHAT_EVENT, handler);
    return () => window.removeEventListener(UNREAD_CHAT_EVENT, handler);
  }, []);

  const isActive = (href: string) => pathname === href;

  const openChat = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
    }
    setMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "var(--background)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-sm font-semibold tracking-wider hover:opacity-70 transition-opacity"
          style={{ color: "var(--foreground)" }}
        >
          LIONEL.DEV
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
          <Link
            href="/courses"
            className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
            style={{
              color: isActive("/courses") ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            <GraduationCap size={14} strokeWidth={1.5} />
            {t("courses")}
          </Link>
          <Link
            href="/coaching"
            className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
            style={{
              color: isActive("/coaching") ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            <Rocket size={14} strokeWidth={1.5} />
            {t("coaching")}
          </Link>
          <button
            type="button"
            onClick={openChat}
            className="relative flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--muted-foreground)" }}
          >
            <MessageCircle size={14} strokeWidth={1.5} />
            {t("chat")}
            {chatUnread > 0 && (
              <span
                className="min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ml-0.5"
                style={{ background: "#ef4444", color: "white" }}
                aria-label={`${chatUnread} nouveau${chatUnread > 1 ? "x" : ""}`}
              >
                {chatUnread > 9 ? "9+" : chatUnread}
              </span>
            )}
          </button>
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
          <Link
            href="/courses"
            className="flex items-center gap-2 text-sm py-2"
            style={{ color: "var(--muted-foreground)" }}
            onClick={() => setMenuOpen(false)}
          >
            <GraduationCap size={14} strokeWidth={1.5} />
            {t("courses")}
          </Link>
          <Link
            href="/coaching"
            className="flex items-center gap-2 text-sm py-2"
            style={{ color: "var(--muted-foreground)" }}
            onClick={() => setMenuOpen(false)}
          >
            <Rocket size={14} strokeWidth={1.5} />
            {t("coaching")}
          </Link>
          <button
            type="button"
            onClick={openChat}
            className="flex items-center gap-2 text-sm py-2 text-left"
            style={{ color: "var(--muted-foreground)" }}
          >
            <MessageCircle size={14} strokeWidth={1.5} />
            {t("chat")}
            {chatUnread > 0 && (
              <span
                className="min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ml-1"
                style={{ background: "#ef4444", color: "white" }}
              >
                {chatUnread > 9 ? "9+" : chatUnread}
              </span>
            )}
          </button>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
