"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { SkillNode } from "./skillIcons";

// Canvas chargé côté client uniquement (jamais dans le rendu serveur).
const SkillsCanvas = dynamic(() => import("./SkillsCanvas"), { ssr: false });

/**
 * Constellation 3D des compétences, positionnée derrière le contenu. Le
 * conteneur laisse passer les événements (pointer-events none) ; seules les
 * pastilles des nœuds les réactivent. Rendu à partir de md (desktop).
 */
export function SkillsBackground({ skills }: { skills: SkillNode[] }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <SkillsCanvas skills={skills} />
    </div>
  );
}
