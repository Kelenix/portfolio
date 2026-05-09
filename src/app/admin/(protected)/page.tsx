import { prisma } from "@/lib/db";
import { FolderOpen, Star, MessageSquare, Share2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const [projectCount, accomplishmentCount, messageCount, unreadCount] =
    await Promise.all([
      prisma.project.count(),
      prisma.accomplishment.count(),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { read: false } }),
    ]);

  const stats = [
    {
      label: "Projets",
      value: projectCount,
      icon: FolderOpen,
      href: "/admin/projects",
    },
    {
      label: "Accomplissements",
      value: accomplishmentCount,
      icon: Star,
      href: "/admin/accomplishments",
    },
    {
      label: "Messages",
      value: messageCount,
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
      href: "/admin/messages",
    },
  ];

  return (
    <div>
      <h1
        className="text-xl font-mono font-bold mb-8"
        style={{ color: "var(--foreground)" }}
      >
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, badge, href }) => (
          <a
            key={label}
            href={href}
            className="relative p-5 rounded-lg border transition-all duration-200 hover:opacity-80 block"
            style={{
              background: "var(--muted)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <Icon size={18} strokeWidth={1.5} style={{ color: "var(--muted-foreground)" }} />
              {badge !== undefined && (
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--accent)", color: "white" }}
                >
                  {badge}
                </span>
              )}
            </div>
            <p
              className="text-2xl font-mono font-bold mb-1"
              style={{ color: "var(--foreground)" }}
            >
              {value}
            </p>
            <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
              {label}
            </p>
          </a>
        ))}
      </div>

      <div
        className="p-5 rounded-lg border"
        style={{ background: "var(--muted)", borderColor: "var(--border)" }}
      >
        <p
          className="text-xs font-mono font-semibold tracking-wider uppercase mb-3"
          style={{ color: "var(--muted-foreground)" }}
        >
          Accès rapide
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Modifier le profil", href: "/admin/settings" },
            { label: "Ajouter un projet", href: "/admin/projects" },
            { label: "Voir le portfolio", href: "/fr" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-xs font-mono px-3 py-1.5 rounded-lg border transition-all duration-200 hover:opacity-70"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
                background: "var(--background)",
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
