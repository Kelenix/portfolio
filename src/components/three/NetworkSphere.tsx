"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Group, Vector3 } from "three";
import type { IconType } from "react-icons";
import { clamp01, lerp } from "./animation";
import { ICON_MAP, type SkillNode } from "./skillIcons";

const R = 2.3; // rayon
const NEIGHBORS = 3; // arêtes par nœud

interface NetworkSphereProps {
  skills: SkillNode[];
  pointColor: string;
  lineColor: string;
  pointOpacity: number;
  lineOpacity: number;
}

/** Pastille DOM (icône seule, nom au survol) accrochée à un nœud. */
function IconChip({ icon: Icon, name }: { icon?: IconType; name: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: hovered ? "4px 10px" : "5px",
        borderRadius: 9999,
        background: "var(--background)",
        border: "1px solid var(--border)",
        color: "var(--foreground)",
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
        boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
        cursor: "default",
        transition: "padding 0.15s ease",
      }}
    >
      {Icon && <Icon size={14} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />}
      {hovered && <span>{name}</span>}
    </div>
  );
}

/**
 * Constellation de compétences : chaque tech est accrochée à un nœud réparti sur
 * une sphère (Fibonacci), reliés entre voisins. Rotation lente + parallaxe. Les
 * nœuds à l'arrière sont estompés pour rester lisible.
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
  const tmp = useRef(new Vector3());
  const N = skills.length;

  const { pts, pointPositions, linePositions } = useMemo(() => {
    const pts: [number, number, number][] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = N > 1 ? 1 - (i / (N - 1)) * 2 : 0;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * golden;
      pts.push([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R]);
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

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.07;
    group.current.rotation.x = lerp(
      group.current.rotation.x,
      -state.pointer.y * 0.12,
      0.04
    );
    // Estompe les nœuds orientés vers l'arrière (z < 0 après rotation).
    const rot = group.current.rotation;
    for (let i = 0; i < N; i++) {
      const el = chipRefs.current[i];
      if (!el) continue;
      tmp.current.set(pts[i][0], pts[i][1], pts[i][2]).applyEuler(rot);
      const zn = tmp.current.z / R; // -1 (arrière) .. 1 (avant)
      const o = clamp01((zn + 0.2) / 1.0);
      el.style.opacity = String(0.12 + 0.88 * o);
      el.style.pointerEvents = zn > 0 ? "auto" : "none";
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
        <Html key={i} position={p} center zIndexRange={[50, 0]}>
          <div ref={(el) => { chipRefs.current[i] = el; }}>
            <IconChip icon={ICON_MAP[skills[i].iconName]} name={skills[i].name} />
          </div>
        </Html>
      ))}
    </group>
  );
}
