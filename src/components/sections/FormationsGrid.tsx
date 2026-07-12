"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export interface FormationCard {
  name: string;
  thumbnail: string | null;
  price: string;
  original: string | null;
  isFree: boolean;
  badge: string | null;
  url: string;
}

/**
 * Vitrine des formations/eBooks Chariow : cartes avec visuel, prix (barré si
 * promo) et lien d'achat. Le paiement et la livraison sont gérés par Chariow.
 */
export function FormationsGrid({ items, cta, freeLabel }: { items: FormationCard[]; cta: string; freeLabel: string }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p, i) => (
        <motion.a
          key={i}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }}
          viewport={{ once: true }}
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
          className="group flex flex-col overflow-hidden rounded-xl border transition-shadow duration-200 hover:shadow-lg"
          style={{ background: "var(--background)", borderColor: "var(--border)" }}
        >
          {/* Visuel */}
          <div className="relative aspect-[16/10] w-full overflow-hidden" style={{ background: "var(--muted)" }}>
            {p.thumbnail ? (
              <Image
                src={p.thumbnail}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center font-mono text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                {p.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            {p.badge && (
              <span
                className="absolute left-3 top-3 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold backdrop-blur"
                style={{ background: "var(--background)", color: "var(--muted-foreground)", borderColor: "var(--border)" }}
              >
                {p.badge}
              </span>
            )}
          </div>

          {/* Contenu */}
          <div className="flex flex-1 flex-col p-4">
            <p
              className="mb-3 flex-1 font-mono text-sm font-semibold leading-snug"
              style={{ color: "var(--foreground)" }}
            >
              {p.name}
            </p>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                {p.isFree ? (
                  <span className="font-mono text-sm font-bold" style={{ color: "var(--foreground)" }}>
                    {freeLabel}
                  </span>
                ) : (
                  <>
                    <span className="font-mono text-sm font-bold" style={{ color: "var(--foreground)" }}>
                      {p.price}
                    </span>
                    {p.original && (
                      <span
                        className="font-mono text-xs line-through"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {p.original}
                      </span>
                    )}
                  </>
                )}
              </div>
              <span
                className="flex items-center gap-1 font-mono text-xs transition-opacity group-hover:opacity-70"
                style={{ color: "var(--muted-foreground)" }}
              >
                {cta}
                <ArrowUpRight
                  size={13}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </div>
          </div>
        </motion.a>
      ))}
    </div>
  );
}
