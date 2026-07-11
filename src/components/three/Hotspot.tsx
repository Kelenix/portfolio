"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import type { Group } from "three";
import { clamp01, easeOutBack, lerp } from "./animation";

interface HotspotProps {
  onSelect: () => void;
  onHover?: (hovered: boolean) => void;
  /** Délai d'apparition (secondes depuis le montage). */
  delay?: number;
  duration?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}

/**
 * Objet interactif : apparition en pop (scale 0 → 1), curseur pointeur + léger
 * agrandissement lissé au survol, clic → onSelect(). Le libellé est géré par
 * les <Callout>.
 */
export function Hotspot({
  onSelect,
  onHover,
  delay = 0,
  duration = 0.5,
  position,
  rotation,
  children,
}: HotspotProps) {
  const ref = useRef<Group>(null);
  const start = useRef<number | null>(null);
  const hoveredRef = useRef(false);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    if (!ref.current) return;
    if (start.current === null) start.current = state.clock.elapsedTime;
    const p = clamp01((state.clock.elapsedTime - start.current - delay) / duration);
    if (p < 1) {
      // Phase d'entrée : on suit la courbe de pop directement.
      ref.current.scale.setScalar(easeOutBack(p));
    } else {
      // Après l'entrée : lissage vers l'échelle de survol.
      const target = hoveredRef.current ? 1.08 : 1;
      ref.current.scale.setScalar(lerp(ref.current.scale.x, target, 0.2));
    }
  });

  const setHover = (v: boolean) => {
    hoveredRef.current = v;
    setHovered(v);
    onHover?.(v);
  };

  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      scale={0}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHover(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {children}
    </group>
  );
}
