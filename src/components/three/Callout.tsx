"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, useCursor } from "@react-three/drei";
import type { Palette } from "./palette";
import { clamp01, easeOutCubic, vlerp } from "./animation";

interface CalloutProps {
  /** Point d'accroche sur l'objet (coords locales de la scène). */
  anchor: [number, number, number];
  /** Position du label, déporté dans l'espace vide. */
  to: [number, number, number];
  label: string;
  palette: Palette;
  onSelect: () => void;
  /** Délai avant le tracé (secondes depuis le montage). */
  delay?: number;
  drawDuration?: number;
}

/**
 * Ligne de rappel objet → label. À l'entrée : la ligne se trace de l'objet vers
 * le label, puis la pastille (toujours visible ensuite et cliquable) apparaît.
 */
export function Callout({
  anchor,
  to,
  label,
  palette,
  onSelect,
  delay = 0,
  drawDuration = 0.4,
}: CalloutProps) {
  const [hovered, setHovered] = useState(false);
  const [started, setStarted] = useState(false);
  const [pill, setPill] = useState(false);
  const [end, setEnd] = useState<[number, number, number]>(anchor);
  const startTime = useRef<number | null>(null);
  const done = useRef(false);
  useCursor(hovered);

  useFrame((state) => {
    if (done.current) return;
    if (startTime.current === null) startTime.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - startTime.current - delay;
    if (t < 0) return; // en attente du délai
    if (!started) setStarted(true);
    const p = clamp01(t / drawDuration);
    setEnd(vlerp(anchor, to, easeOutCubic(p)));
    if (p >= 1) {
      setPill(true);
      done.current = true;
    }
  });

  return (
    <group>
      {started && (
        <>
          <Line
            points={[anchor, end]}
            color={palette.line}
            lineWidth={1.4}
            transparent
            opacity={0.75}
          />
          <mesh position={anchor}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color={palette.line} />
          </mesh>
        </>
      )}

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
            opacity: pill ? 1 : 0,
            pointerEvents: pill ? "auto" : "none",
            boxShadow: hovered
              ? "0 4px 16px rgba(0,0,0,0.28)"
              : "0 2px 10px rgba(0,0,0,0.18)",
            transform: `scale(${pill ? (hovered ? 1.07 : 1) : 0.6})`,
            transition: "transform 0.2s ease, opacity 0.25s ease, box-shadow 0.15s ease",
          }}
        >
          {label}
        </button>
      </Html>
    </group>
  );
}
