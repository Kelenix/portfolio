"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderOpen,
  Star,
  Share2,
  MessageSquare,
  Settings,
  LogOut,
  Code2,
  BookOpen,
  PanelBottom,
  Smartphone,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projets", icon: FolderOpen },
  { href: "/admin/mobile-apps", label: "Apps mobiles", icon: Smartphone },
  { href: "/admin/accomplishments", label: "Accomplissements", icon: Star },
  { href: "/admin/skills", label: "Tech Stack", icon: Code2 },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/social", label: "Réseaux", icon: Share2 },
  { href: "/admin/footer", label: "Footer", icon: PanelBottom },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 min-h-screen border-r flex flex-col"
      style={{
        background: "var(--background)",
        borderColor: "var(--border)",
      }}
    >
      <div
        className="p-5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <p
          className="text-xs font-mono font-bold tracking-widest uppercase"
          style={{ color: "var(--foreground)" }}
        >
          LIONEL.DEV
        </p>
        <p
          className="text-xs font-mono mt-0.5"
          style={{ color: "var(--muted-foreground)" }}
        >
          Administration
        </p>
      </div>

      <nav className="flex-1 p-3">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono transition-all duration-150"
                  style={{
                    background: isActive ? "var(--muted)" : "transparent",
                    color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                  }}
                >
                  <Icon size={14} strokeWidth={1.5} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-xs font-mono transition-all duration-150 hover:opacity-70"
          style={{ color: "var(--muted-foreground)" }}
        >
          <LogOut size={14} strokeWidth={1.5} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
