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
      camera={{ position: [0, 0, 7.8], fov: 50 }}
    >
      <NetworkSphere
        skills={skills}
        pointColor={dark ? "#52525b" : "#c4c4c8"}
        lineColor={dark ? "#3f3f46" : "#e0e0e3"}
        pointOpacity={dark ? 0.6 : 0.7}
        lineOpacity={dark ? 0.22 : 0.35}
      />
    </Canvas>
  );
}
