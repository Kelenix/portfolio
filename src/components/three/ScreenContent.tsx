"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh, MeshBasicMaterial } from "three";
import type { Palette } from "./palette";
import { clamp01 } from "./animation";

// Largeurs des « lignes de code » (aspect irrégulier, comme du vrai code).
const LINE_WIDTHS = [0.82, 0.5, 0.66, 0.34, 0.72, 0.46, 0.6, 0.38, 0.76, 0.52];
const PITCH = 0.08; // espacement vertical entre lignes
const LINE_H = 0.04;
const BAND = 0.5; // hauteur visible (les lignes s'effacent au-delà)
const LEFT = -0.5; // marge gauche dans l'écran

/**
 * Contenu animé du moniteur : des barres façon lignes de code qui défilent vers
 * le haut en boucle, plus un curseur qui clignote. Rendu en meshBasicMaterial
 * (non éclairé) pour un léger effet « écran allumé ».
 */
export function ScreenContent({
  palette,
  position,
}: {
  palette: Palette;
  position?: [number, number, number];
}) {
  const linesRef = useRef<Group>(null);
  const cursorRef = useRef<Mesh>(null);

  const total = LINE_WIDTHS.length * PITCH;

  useFrame((state) => {
    const s = state.clock.elapsedTime * 0.15; // vitesse de défilement
    const g = linesRef.current;
    if (g) {
      g.children.forEach((child, i) => {
        const mesh = child as Mesh;
        let y = (((i * PITCH - s) % total) + total) % total; // 0..total
        y -= total / 2;
        mesh.position.y = y;
        const mat = mesh.material as MeshBasicMaterial;
        mat.opacity = clamp01((BAND / 2 - Math.abs(y)) / 0.06) * 0.75;
      });
    }
    if (cursorRef.current) {
      const mat = cursorRef.current.material as MeshBasicMaterial;
      mat.opacity = Math.sin(state.clock.elapsedTime * 4) > 0 ? 0.9 : 0.08;
    }
  });

  return (
    <group position={position}>
      <group ref={linesRef}>
        {LINE_WIDTHS.map((w, i) => (
          <mesh key={i} position={[LEFT + w / 2, 0, 0]} scale={[w, 1, 1]}>
            <planeGeometry args={[1, LINE_H]} />
            <meshBasicMaterial color={palette.screenGlow} transparent opacity={0} />
          </mesh>
        ))}
      </group>
      {/* curseur clignotant */}
      <mesh ref={cursorRef} position={[LEFT + 0.02, -0.18, 0.002]}>
        <planeGeometry args={[0.025, LINE_H]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
