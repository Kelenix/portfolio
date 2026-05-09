"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiFramer,
  SiNodedotjs, SiPrisma, SiPostgresql, SiSqlite, SiGraphql,
  SiVercel, SiDocker, SiGithubactions, SiGit,
  SiFigma, SiPostman,
} from "react-icons/si";
import { TbApi, TbBrandVscode } from "react-icons/tb";

const techGroups = {
  frontend: [
    { name: "React", icon: SiReact },
    { name: "Next.js", icon: SiNextdotjs },
    { name: "TypeScript", icon: SiTypescript },
    { name: "Tailwind CSS", icon: SiTailwindcss },
    { name: "Framer Motion", icon: SiFramer },
  ],
  backend: [
    { name: "Node.js", icon: SiNodedotjs },
    { name: "Prisma", icon: SiPrisma },
    { name: "PostgreSQL", icon: SiPostgresql },
    { name: "SQLite", icon: SiSqlite },
    { name: "GraphQL", icon: SiGraphql },
  ],
  devops: [
    { name: "Vercel", icon: SiVercel },
    { name: "Docker", icon: SiDocker },
    { name: "GitHub Actions", icon: SiGithubactions },
    { name: "Git", icon: SiGit },
  ],
  tools: [
    { name: "VS Code", icon: TbBrandVscode },
    { name: "Figma", icon: SiFigma },
    { name: "Postman", icon: SiPostman },
    { name: "REST API", icon: TbApi },
  ],
} as const;

type GroupKey = keyof typeof techGroups;

export function TechStack() {
  const t = useTranslations("tech");

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {(Object.entries(techGroups) as [GroupKey, (typeof techGroups)[GroupKey]][]).map(
            ([group, items], gi) => (
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
                  {items.map((tech, i) => {
                    const Icon = tech.icon;
                    return (
                      <motion.div
                        key={tech.name}
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
                        <Icon size={13} style={{ color: "var(--muted-foreground)" }} />
                        {tech.name}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )
          )}
        </div>
      </motion.div>
    </section>
  );
}
