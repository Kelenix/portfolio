"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";

export function Contact({ email }: { email: string }) {
  const t = useTranslations("contact");

  return (
    <section
      className="py-16"
      style={{ background: "var(--muted)" }}
    >
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2
            className="text-2xl md:text-3xl font-mono font-bold mb-3"
            style={{ color: "var(--foreground)" }}
          >
            {t("title")}
          </h2>
          <p
            className="text-sm mb-8 max-w-md mx-auto"
            style={{ color: "var(--muted-foreground)" }}
          >
            {t("subtitle")}
          </p>

          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-lg border font-mono text-sm transition-all duration-200 hover:opacity-80 group"
            style={{
              borderColor: "var(--foreground)",
              color: "var(--foreground)",
              background: "transparent",
            }}
          >
            <Mail size={16} strokeWidth={1.5} />
            {email}
            <ArrowRight
              size={14}
              strokeWidth={1.5}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
