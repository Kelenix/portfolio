"use client";

import { useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { DeskScene } from "./DeskScene";
import { getPalette } from "./palette";
import type { DeskLink, DeskLinks } from "./links";

/**
 * Wrapper <Canvas> de la scène. Chargé dynamiquement (ssr:false) par
 * InteractiveDesk pour ne jamais peser sur le rendu serveur ni le SEO.
 *
 * Vue quasi frontale et statique (pas de rotation auto) pour que le schéma en
 * étoile (labels + lignes de rappel) reste lisible et stable. L'utilisateur
 * peut légèrement faire pivoter à la souris.
 */
export default function InteractiveDeskCanvas({
  links,
  active = true,
}: {
  links?: DeskLinks;
  active?: boolean;
}) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const palette = getPalette(dark);
  const router = useRouter();

  const handleSelect = useCallback(
    (link: DeskLink) => {
      if (link.kind === "anchor") {
        document
          .getElementById(link.href)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (link.kind === "route") {
        router.push(link.href);
      } else {
        window.open(link.href, "_blank", "noopener,noreferrer");
      }
    },
    [router]
  );

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 2.0, 6.4], fov: 46 }}
      frameloop={active ? "always" : "never"}
      onCreated={({ camera }) => camera.lookAt(0, 0.4, 0)}
    >
      {/* Éclairage adapté au thème (pas d'HDR externe → self-contained) */}
      <ambientLight intensity={dark ? 0.45 : 0.7} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={dark ? 1.4 : 1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[-4, 2, -3]} intensity={dark ? 0.35 : 0.3} />

      <DeskScene palette={palette} links={links} onSelect={handleSelect} />

      <ContactShadows
        position={[0, -1.14, 0]}
        scale={9}
        blur={2.6}
        far={3}
        opacity={dark ? 0.5 : 0.35}
        color={palette.shadow}
      />
    </Canvas>
  );
}
