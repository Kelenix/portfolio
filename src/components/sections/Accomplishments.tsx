"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { boldMarkdown } from "@/lib/utils";

interface Accomplishment {
  id: string;
  text: string;
  link?: string | null;
  linkLabel?: string | null;
}

export function Accomplishments({ items }: { items: Accomplishment[] }) {
  const t = useTranslations("done");

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2
          className="text-xs font-mono font-semibold tracking-widest uppercase mb-8 pb-2 border-b"
          style={{ color: "var(--muted-foreground)", borderColor: "var(--border)" }}
        >
          {t("title")}
        </h2>

        <ul className="space-y-4">
          {items.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-start gap-3 text-base leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span
                className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: "var(--foreground)" }}
              />
              <span>
                <span
                  dangerouslySetInnerHTML={{ __html: boldMarkdown(item.text) }}
                  className="[&_strong]:font-semibold"
                  style={{ color: "var(--foreground)" } as React.CSSProperties}
                />
                {item.link && (
                  <>
                    {" — "}
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 transition-opacity hover:opacity-70"
                      style={{ color: "var(--foreground)" }}
                    >
                      {item.linkLabel ?? item.link}
                    </a>
                  </>
                )}
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
