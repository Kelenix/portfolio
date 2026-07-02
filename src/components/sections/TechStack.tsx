"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiTailwindcss, SiFramer,
  SiVuedotjs, SiAngular, SiSvelte, SiAstro,
  SiNodedotjs, SiPrisma, SiPostgresql, SiMongodb, SiMysql, SiSqlite, SiGraphql,
  SiPython, SiDjango, SiPhp, SiLaravel, SiRust, SiGo, SiRedis, SiSupabase, SiFirebase,
  SiDocker, SiKubernetes, SiVercel, SiGithubactions, SiGit, SiNginx, SiLinux,
  SiGooglecloud,
  SiFigma, SiPostman, SiGithub, SiNotion, SiJira,
} from "react-icons/si";
import { TbApi, TbBrandVscode } from "react-icons/tb";
import type { IconType } from "react-icons";

export const ICON_MAP: Record<string, IconType> = {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiTailwindcss, SiFramer,
  SiVuedotjs, SiAngular, SiSvelte, SiAstro,
  SiNodedotjs, SiPrisma, SiPostgresql, SiMongodb, SiMysql, SiSqlite, SiGraphql,
  SiPython, SiDjango, SiPhp, SiLaravel, SiRust, SiGo, SiRedis, SiSupabase, SiFirebase,
  SiDocker, SiKubernetes, SiVercel, SiGithubactions, SiGit, SiNginx, SiLinux,
  SiGooglecloud,
  SiFigma, SiPostman, SiGithub, SiNotion, SiJira,
  TbBrandVscode, TbApi,
};

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
        <h2
          className="text-xs font-mono font-semibold tracking-widest uppercase mb-6 pb-2 border-b"
          style={{ color: "var(--muted-foreground)", borderColor: "var(--border)" }}
        >
          {t("title")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: gi * 0.05 + i * 0.04, duration: 0.3 }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono cursor-default transition-colors duration-150"
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
