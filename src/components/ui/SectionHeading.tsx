"use client";

import { motion } from "framer-motion";

/**
 * Titre de section (mono, majuscules) avec un trait qui se « dessine » de la
 * gauche vers la droite quand le titre entre dans le viewport.
 */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2
        className="text-xs font-mono font-semibold tracking-widest uppercase pb-2"
        style={{ color: "var(--muted-foreground)" }}
      >
        {children}
      </h2>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "left", height: 1, background: "var(--border)" }}
      />
    </div>
  );
}
