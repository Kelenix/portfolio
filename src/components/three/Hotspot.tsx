"use client";

import { useState } from "react";
import { useCursor } from "@react-three/drei";

interface HotspotProps {
  onSelect: () => void;
  onHover?: (hovered: boolean) => void;
  position?: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}

/**
 * Enveloppe un objet du bureau pour le rendre interactif : curseur pointeur au
 * survol, léger agrandissement, et clic → onSelect(). Le libellé lui-même est
 * géré séparément par les <Callout> (schéma en étoile).
 */
export function Hotspot({
  onSelect,
  onHover,
  position,
  rotation,
  children,
}: HotspotProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group
      position={position}
      rotation={rotation}
      scale={hovered ? 1.08 : 1}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover?.(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onHover?.(false);
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
