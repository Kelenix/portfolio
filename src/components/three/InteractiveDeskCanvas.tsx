"use client";

import { useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { DeskScene } from "./DeskScene";
import { getPalette } from "./palette";
import type { DeskLink, DeskLinks } from "./links";

/**
 * Wrapper <Canvas> de la scène. Chargé dynamiquement (ssr:false) par
 * InteractiveDesk pour ne jamais peser sur le rendu serveur ni le SEO.
 */
export default function InteractiveDeskCanvas({ links }: { links?: DeskLinks }) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const palette = getPalette(dark);
  const router = useRouter();

  // Rotation auto en pause tant qu'un objet est survolé (confort de clic).
  const [interacting, setInteracting] = useState(false);

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
      camera={{ position: [3.4, 2.5, 4.2], fov: 42 }}
    >
      {/* Éclairage adapté au thème (pas d'HDR externe → self-contained) */}
      <ambientLight intensity={dark ? 0.45 : 0.7} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={dark ? 1.4 : 1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-4, 2, -3]} intensity={dark ? 0.35 : 0.3} />

      <DeskScene
        palette={palette}
        links={links}
        onSelect={handleSelect}
        onHover={setInteracting}
      />

      <ContactShadows
        position={[0, -1.14, 0]}
        scale={9}
        blur={2.6}
        far={3}
        opacity={dark ? 0.5 : 0.35}
        color={palette.shadow}
      />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={!interacting}
        autoRotateSpeed={0.8}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0.2, 0]}
      />
    </Canvas>
  );
}
