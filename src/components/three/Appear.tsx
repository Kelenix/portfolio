"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { clamp01, easeOutBack } from "./animation";

interface AppearProps {
  /** Délai avant le début de l'apparition (secondes depuis le montage). */
  delay?: number;
  duration?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}

/**
 * Fait « pop » ses enfants (scale 0 → 1 avec léger rebond) après `delay`.
 * Pour les objets décoratifs non cliquables. Les objets cliquables gèrent leur
 * propre apparition dans <Hotspot>.
 */
export function Appear({ delay = 0, duration = 0.5, position, rotation, children }: AppearProps) {
  const ref = useRef<Group>(null);
  const start = useRef<number | null>(null);

  useFrame((state) => {
    if (!ref.current) return;
    if (start.current === null) start.current = state.clock.elapsedTime;
    const p = clamp01((state.clock.elapsedTime - start.current - delay) / duration);
    ref.current.scale.setScalar(easeOutBack(p));
  });

  return (
    <group ref={ref} position={position} rotation={rotation} scale={0}>
      {children}
    </group>
  );
}
