"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaGooglePlay, FaApple } from "react-icons/fa";

interface MobileAppItem {
  id: string;
  name: string;
  desc: string;
  iconUrl: string;
  playStoreUrl?: string | null;
  appStoreUrl?: string | null;
}

export function MobileApps({ items }: { items: MobileAppItem[] }) {
  const t = useTranslations("mobileApps");

  if (items.length === 0) return null;

  return (
    <section id="apps" className="scroll-mt-20 py-10">
      <div className="mx-auto max-w-5xl px-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 26 }}
                className="group p-5 rounded-lg border transition-shadow duration-200 hover:shadow-lg"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border"
                    style={{ borderColor: "var(--border)", background: "var(--muted)" }}
                  >
                    {app.iconUrl ? (
                      <Image
                        src={app.iconUrl}
                        alt={app.name}
                        fill
                        sizes="56px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <h3
                      className="font-mono font-semibold text-sm"
                      style={{ color: "var(--foreground)" }}
                    >
                      {app.name}
                    </h3>
                    {app.desc && (
                      <p
                        className="text-xs mt-1 leading-relaxed line-clamp-2"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {app.desc}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {app.playStoreUrl && (
                    <a
                      href={app.playStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-opacity hover:opacity-70"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                      aria-label={`${app.name} sur Google Play`}
                    >
                      <FaGooglePlay size={11} />
                      Play Store
                    </a>
                  )}
                  {app.appStoreUrl && (
                    <a
                      href={app.appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-opacity hover:opacity-70"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                      aria-label={`${app.name} sur l'App Store`}
                    >
                      <FaApple size={12} />
                      App Store
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
