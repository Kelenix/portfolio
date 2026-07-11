"use client";

import { useState } from "react";
import { Html, Line, useCursor } from "@react-three/drei";
import type { Palette } from "./palette";

interface CalloutProps {
  /** Point d'accroche sur l'objet (coords locales de la scène). */
  anchor: [number, number, number];
  /** Position du label, déporté dans l'espace vide. */
  to: [number, number, number];
  label: string;
  palette: Palette;
  onSelect: () => void;
}

/**
 * Ligne de rappel objet → label, avec un label toujours visible et cliquable
 * (style « schéma annoté / étoile »).
 */
export function Callout({ anchor, to, label, palette, onSelect }: CalloutProps) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group>
      <Line
        points={[anchor, to]}
        color={palette.line}
        lineWidth={1.4}
        transparent
        opacity={0.75}
      />
      {/* petit point d'accroche sur l'objet */}
      <mesh position={anchor}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color={palette.line} />
      </mesh>

      <Html center position={to} zIndexRange={[100, 0]}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: "12px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            padding: "5px 13px",
            border: "none",
            cursor: "pointer",
            borderRadius: "9999px",
            background: palette.labelBg,
            color: palette.labelText,
            boxShadow: hovered
              ? "0 4px 16px rgba(0,0,0,0.28)"
              : "0 2px 10px rgba(0,0,0,0.18)",
            transform: hovered ? "scale(1.07)" : "scale(1)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
        >
          {label}
        </button>
      </Html>
    </group>
  );
}
