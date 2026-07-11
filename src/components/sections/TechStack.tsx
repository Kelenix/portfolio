"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SkillsBackground } from "@/components/three/SkillsBackground";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ICON_MAP } from "@/components/three/skillIcons";

export type SkillCategory = "frontend" | "backend" | "devops" | "tools";

export interface SkillItem {
  id: string;
  name: string;
  iconName: string;
  category: string;
}

const CATEGORY_ORDER: SkillCategory[] = ["frontend", "backend", "devops", "tools"];

export function TechStack({ skills }: { skills: SkillItem[] }) {
  const t = useTranslations("tech");

  const grouped = CATEGORY_ORDER.reduce<Record<SkillCategory, SkillItem[]>>(
    (acc, cat) => {
      acc[cat] = skills.filter((s) => s.category === cat);
      return acc;
    },
    { frontend: [], backend: [], devops: [], tools: [] }
  );

  const visibleGroups = CATEGORY_ORDER.filter((cat) => grouped[cat].length > 0);

  if (visibleGroups.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeading>{t("title")}</SectionHeading>

        {/* Desktop : constellation 3D des compétences */}
        <div className="relative hidden h-[380px] md:block">
          <SkillsBackground skills={skills} />
        </div>

        {/* Mobile : grille de badges (fallback + SEO préservé dans le HTML) */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:hidden">
          {visibleGroups.map((group, gi) => (
            <motion.div
              key={group}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: gi * 0.1, duration: 0.4 }}
            >
              <p
                className="text-xs font-mono font-semibold tracking-wider uppercase mb-4"
                style={{ color: "var(--muted-foreground)" }}
              >
                {t(group)}
              </p>
              <div className="flex flex-wrap gap-2">
                {grouped[group].map((skill, i) => {
                  const Icon = ICON_MAP[skill.iconName];
                  return (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1, transition: { delay: gi * 0.05 + i * 0.04, duration: 0.3 } }}
                      viewport={{ once: true }}
                      whileHover={{ y: -3, scale: 1.06 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-default"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--muted)",
                        color: "var(--foreground)",
                      }}
                    >
                      {Icon && <Icon size={13} style={{ color: "var(--muted-foreground)" }} />}
                      {skill.name}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
