"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export interface CoursePlatform {
  title: string;
  desc: string;
  href: string | null;
  badge?: string;
  disabled?: boolean;
}

/**
 * Grille des plateformes de formation : apparition au scroll (stagger) et
 * survol (soulèvement + flèche qui glisse) cohérents avec le reste du site.
 */
export function CoursesGrid({ items }: { items: CoursePlatform[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((p, i) => {
        const content = (
          <>
            <div className="mb-3 flex items-start justify-between gap-3">
              <p
                className="font-mono text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {p.title}
              </p>
              {p.badge ? (
                <span
                  className="shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px]"
                  style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                >
                  {p.badge}
                </span>
              ) : (
                <ExternalLink
                  size={14}
                  strokeWidth={1.5}
                  className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  style={{ color: "var(--muted-foreground)" }}
                />
              )}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              {p.desc}
            </p>
          </>
        );

        const style = { background: "var(--muted)", borderColor: "var(--border)" };
        const enter = {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } },
          viewport: { once: true },
        } as const;

        if (p.disabled || !p.href) {
          return (
            <motion.div
              key={i}
              {...enter}
              className="block rounded-lg border p-5 opacity-70"
              style={style}
              aria-disabled
            >
              {content}
            </motion.div>
          );
        }

        return (
          <motion.a
            key={i}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            {...enter}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            className="group block rounded-lg border p-5 transition-shadow duration-200 hover:shadow-lg"
            style={style}
          >
            {content}
          </motion.a>
        );
      })}
    </div>
  );
}
