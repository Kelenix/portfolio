"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Group, Vector3 } from "three";
import type { IconType } from "react-icons";
import { clamp01 } from "./animation";
import { ICON_MAP, type SkillNode } from "./skillIcons";

const R = 2.85; // rayon de base
// Facteurs de forme : disque large et aplati (remplit un rectangle large/court).
const SX = 1.55;
const SY = 0.62;
const SZ = 1.55;
const NEIGHBORS = 3;

interface NetworkSphereProps {
  skills: SkillNode[];
  pointColor: string;
  lineColor: string;
  pointOpacity: number;
  lineOpacity: number;
}

/** Étiquette DOM (icône + nom, façon nuage de tags) accrochée à un nœud. */
function IconChip({ icon: Icon, name }: { icon?: IconType; name: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        color: "var(--foreground)",
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {Icon && <Icon size={15} style={{ flexShrink: 0, color: "var(--muted-foreground)" }} />}
      <span>{name}</span>
    </div>
  );
}

/**
 * Constellation de compétences : chaque tech est accrochée à un nœud réparti sur
 * un ellipsoïde aplati (disque). La caméra tourne (auto + drag souris via
 * OrbitControls) ; les nœuds orientés vers l'arrière sont estompés.
 */
export function NetworkSphere({
  skills,
  pointColor,
  lineColor,
  pointOpacity,
  lineOpacity,
}: NetworkSphereProps) {
  const group = useRef<Group>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nodeDir = useRef(new Vector3());
  const camDir = useRef(new Vector3());
  const N = skills.length;

  const { pts, pointPositions, linePositions } = useMemo(() => {
    const pts: [number, number, number][] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = N > 1 ? 1 - (i / (N - 1)) * 2 : 0;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * golden;
      pts.push([Math.cos(th) * r * R * SX, y * R * SY, Math.sin(th) * r * R * SZ]);
    }

    const pointPositions = new Float32Array(N * 3);
    pts.forEach((p, i) => {
      pointPositions[i * 3] = p[0];
      pointPositions[i * 3 + 1] = p[1];
      pointPositions[i * 3 + 2] = p[2];
    });

    const dist2 = (a: [number, number, number], b: [number, number, number]) =>
      (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

    const edges = new Set<string>();
    for (let i = 0; i < N; i++) {
      pts
        .map((q, j) => ({ j, d: dist2(pts[i], q) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, NEIGHBORS)
        .forEach(({ j }) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`));
    }

    const edgeArr = [...edges].map(
      (k) => k.split("-").map(Number) as [number, number]
    );
    const linePositions = new Float32Array(edgeArr.length * 6);
    edgeArr.forEach(([a, b], k) => {
      linePositions.set([...pts[a], ...pts[b]], k * 6);
    });

    return { pts, pointPositions, linePositions };
  }, [N]);

  useFrame((state) => {
    // Estompe les nœuds orientés à l'opposé de la caméra (dot < 0).
    const cd = camDir.current.copy(state.camera.position).normalize();
    for (let i = 0; i < N; i++) {
      const el = chipRefs.current[i];
      if (!el) continue;
      const f = nodeDir.current
        .set(pts[i][0], pts[i][1], pts[i][2])
        .normalize()
        .dot(cd);
      el.style.opacity = String(0.1 + 0.9 * clamp01((f + 0.15) / 1.0));
    }
  });

  return (
    <group ref={group}>
      {linePositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={lineColor} transparent opacity={lineOpacity} />
        </lineSegments>
      )}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pointPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={pointColor}
          size={0.05}
          sizeAttenuation
          transparent
          opacity={pointOpacity}
        />
      </points>

      {pts.map((p, i) => (
        <Html key={i} position={p} center zIndexRange={[50, 0]} style={{ pointerEvents: "none" }}>
          <div ref={(el) => { chipRefs.current[i] = el; }} style={{ pointerEvents: "none" }}>
            <IconChip icon={ICON_MAP[skills[i].iconName]} name={skills[i].name} />
          </div>
        </Html>
      ))}
    </group>
  );
}
