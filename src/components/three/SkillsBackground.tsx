"use client";

import dynamic from "next/dynamic";

// Canvas décoratif chargé côté client uniquement (jamais dans le rendu serveur).
const SkillsCanvas = dynamic(() => import("./SkillsCanvas"), { ssr: false });

/**
 * Couche de fond 3D pour la section Compétences : positionnée en absolu derrière
 * le contenu, sans interaction (pointer-events none) pour ne pas gêner les
 * badges au-dessus.
 */
export function SkillsBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <SkillsCanvas />
    </div>
  );
}
