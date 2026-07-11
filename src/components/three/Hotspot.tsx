"use client";

import { useState } from "react";
import { Html, useCursor } from "@react-three/drei";
import type { Palette } from "./palette";

interface HotspotProps {
  label: string;
  palette: Palette;
  onSelect: () => void;
  onHover?: (hovered: boolean) => void;
  /** Hauteur (en unités 3D) du label au-dessus de l'origine de l'objet. */
  labelY?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}

/**
 * Enveloppe un objet du bureau pour le rendre interactif : curseur pointeur au
 * survol, léger agrandissement, pastille-label, et clic → onSelect().
 */
export function Hotspot({
  label,
  palette,
  onSelect,
  onHover,
  labelY = 0.6,
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
      {hovered && (
        <Html
          center
          position={[0, labelY, 0]}
          distanceFactor={7}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
              fontSize: "12px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              padding: "4px 11px",
              borderRadius: "9999px",
              background: palette.labelBg,
              color: palette.labelText,
              boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}
