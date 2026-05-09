"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { parseTags } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  desc: string;
  url?: string | null;
  github?: string | null;
  tags: string;
}

export function Projects({ items }: { items: Project[] }) {
  const t = useTranslations("built");

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
        >
          <h2
            className="text-xs font-mono font-semibold tracking-widest uppercase mb-8 pb-2 border-b"
            style={{ color: "var(--muted-foreground)", borderColor: "var(--border)" }}
          >
            {t("title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((project, i) => {
              const tags = parseTags(project.tags);
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="group relative p-5 rounded-lg border transition-all duration-200 hover:border-opacity-80"
                  style={{
                    background: "var(--background)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3
                      className="font-mono font-semibold text-sm"
                      style={{ color: "var(--foreground)" }}
                    >
                      {project.url ? (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {project.title}
                        </a>
                      ) : (
                        project.title
                      )}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-opacity hover:opacity-70"
                          style={{ color: "var(--muted-foreground)" }}
                          title={t("viewProject")}
                        >
                          <ExternalLink size={14} strokeWidth={1.5} />
                        </a>
                      )}
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-opacity hover:opacity-70"
                          style={{ color: "var(--muted-foreground)" }}
                          title={t("viewCode")}
                        >
                          <FaGithub size={13} />
                        </a>
                      )}
                    </div>
                  </div>

                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {project.desc}
                  </p>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded font-mono"
                          style={{
                            background: "var(--muted)",
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
