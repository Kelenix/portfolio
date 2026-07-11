"use client";

import { Canvas } from "@react-three/fiber";
import { useTheme } from "@/components/providers/ThemeProvider";
import { NetworkSphere } from "./NetworkSphere";
import type { SkillNode } from "./skillIcons";

/**
 * Canvas de la constellation de compétences. Non éclairé, monochrome. Chargé
 * dynamiquement (ssr:false) par SkillsBackground.
 */
export default function SkillsCanvas({ skills }: { skills: SkillNode[] }) {
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 6.5], fov: 50 }}
    >
      <NetworkSphere
        skills={skills}
        pointColor={dark ? "#71717a" : "#a1a1aa"}
        lineColor={dark ? "#3f3f46" : "#d4d4d8"}
        pointOpacity={dark ? 0.85 : 0.9}
        lineOpacity={dark ? 0.35 : 0.5}
      />
    </Canvas>
  );
}
