"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import type { Group } from "three";
import { clamp01, easeOutBack, lerp, clickPulse } from "./animation";

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
 * Objet interactif : apparition en pop, survol lissé, et « press » au clic
 * (compression + rebond) avant la navigation. Le libellé est géré par <Callout>.
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
  const now = useRef(0);
  const clickTime = useRef(-999);
  const hoverScale = useRef(1);
  const hoveredRef = useRef(false);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    now.current = t;
    if (start.current === null) start.current = t;
    const p = clamp01((t - start.current - delay) / duration);
    const appear = easeOutBack(p);
    const hoverTarget = hoveredRef.current ? 1.08 : 1;
    hoverScale.current = lerp(hoverScale.current, hoverTarget, 0.2);
    const pulse = clickPulse(t - clickTime.current);
    ref.current.scale.setScalar(appear * hoverScale.current * pulse);
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
        clickTime.current = now.current; // déclenche le rebond
        window.setTimeout(onSelect, 150); // laisse voir l'effet avant navigation
      }}
    >
      {children}
    </group>
  );
}
