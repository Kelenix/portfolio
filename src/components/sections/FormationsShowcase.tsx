"use client";

import { useState } from "react";
import { FormationsGrid, type FormationCard } from "./FormationsGrid";

interface Category {
  key: string;
  label: string;
}

/**
 * Vitrine filtrable des formations : une barre de filtres par catégorie
 * au-dessus d'une seule grille. Chaque carte garde son étiquette de catégorie.
 */
export function FormationsShowcase({
  items,
  categories,
  allLabel,
  cta,
  freeLabel,
}: {
  items: FormationCard[];
  categories: Category[];
  allLabel: string;
  cta: string;
  freeLabel: string;
}) {
  const [active, setActive] = useState<string>("all");

  const filtered = active === "all" ? items : items.filter((i) => i.category === active);
  const chips: Category[] = [{ key: "all", label: allLabel }, ...categories];

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {chips.map((c) => {
          const on = active === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setActive(c.key)}
              className="rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors duration-150 hover:opacity-80"
              style={{
                background: on ? "var(--foreground)" : "transparent",
                color: on ? "var(--background)" : "var(--muted-foreground)",
                borderColor: on ? "var(--foreground)" : "var(--border)",
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* key={active} : remonte la grille pour rejouer l'animation d'entrée au filtrage */}
      <FormationsGrid key={active} items={filtered} cta={cta} freeLabel={freeLabel} />
    </div>
  );
}
