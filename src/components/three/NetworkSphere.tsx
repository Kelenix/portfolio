"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { lerp } from "./animation";

const N = 42; // nombre de nœuds
const R = 2.2; // rayon
const NEIGHBORS = 3; // arêtes par nœud

interface NetworkSphereProps {
  pointColor: string;
  lineColor: string;
  pointOpacity: number;
  lineOpacity: number;
}

/**
 * Réseau de nœuds répartis sur une sphère (distribution de Fibonacci), reliés à
 * leurs plus proches voisins, qui tourne lentement et suit un peu le curseur.
 * Décoratif : matériaux non éclairés → très léger.
 */
export function NetworkSphere({
  pointColor,
  lineColor,
  pointOpacity,
  lineOpacity,
}: NetworkSphereProps) {
  const group = useRef<Group>(null);

  const { pointPositions, linePositions } = useMemo(() => {
    const pts: [number, number, number][] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
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

    return { pointPositions, linePositions };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.08;
    const targetX = -state.pointer.y * 0.15;
    group.current.rotation.x = lerp(group.current.rotation.x, targetX, 0.04);
  });

  return (
    <group ref={group}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={lineColor} transparent opacity={lineOpacity} />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pointPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={pointColor}
          size={0.07}
          sizeAttenuation
          transparent
          opacity={pointOpacity}
        />
      </points>
    </group>
  );
}
