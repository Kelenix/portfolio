"use client";

import { Canvas } from "@react-three/fiber";
import { useTheme } from "@/components/providers/ThemeProvider";
import { NetworkSphere } from "./NetworkSphere";

/**
 * Canvas décoratif de fond pour la section Compétences. Non éclairé, monochrome,
 * discret. Chargé dynamiquement (ssr:false) par SkillsBackground.
 */
export default function SkillsCanvas() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 6.5], fov: 50 }}
    >
      <NetworkSphere
        pointColor={dark ? "#71717a" : "#a1a1aa"}
        lineColor={dark ? "#3f3f46" : "#d4d4d8"}
        pointOpacity={dark ? 0.85 : 0.9}
        lineOpacity={dark ? 0.35 : 0.5}
      />
    </Canvas>
  );
}
