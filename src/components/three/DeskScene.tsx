"use client";

import type { Palette } from "./palette";

/**
 * Bureau 3D low-poly construit uniquement à partir de primitives (aucun .glb
 * externe). Chaque objet est isolé dans son propre <group> nommé pour que
 * l'étape 2 (hotspots cliquables → data Prisma) soit triviale à brancher.
 *
 * Repère : le plateau du bureau a sa face supérieure à y = 0.07. Tous les
 * objets posés dessus partent de cette hauteur.
 */
export function DeskScene({ palette }: { palette: Palette }) {
  return (
    <group position={[0, -0.2, 0]}>
      {/* ---- Plateau + pieds ---- */}
      <group name="desk">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.14, 1.8]} />
          <meshStandardMaterial color={palette.deskTop} roughness={0.85} metalness={0.05} />
        </mesh>
        {(
          [
            [1.55, -0.75],
            [1.55, 0.75],
            [-1.55, -0.75],
            [-1.55, 0.75],
          ] as const
        ).map(([x, z], i) => (
          <mesh key={i} position={[x, -0.49, z]} castShadow>
            <boxGeometry args={[0.12, 0.84, 0.12]} />
            <meshStandardMaterial color={palette.deskLeg} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ---- Écran (→ Projets) ---- */}
      <group name="monitor" position={[0, 0, -0.5]}>
        <mesh position={[0, 0.09, 0]} castShadow>
          <boxGeometry args={[0.5, 0.04, 0.26]} />
          <meshStandardMaterial color={palette.deviceDark} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.08, 0.42, 0.08]} />
          <meshStandardMaterial color={palette.deviceDark} roughness={0.6} />
        </mesh>
        <group position={[0, 0.66, 0.02]} rotation={[-0.08, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.35, 0.82, 0.06]} />
            <meshStandardMaterial color={palette.deviceDark} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <boxGeometry args={[1.22, 0.7, 0.02]} />
            <meshStandardMaterial
              color={palette.screen}
              emissive={palette.screenGlow}
              emissiveIntensity={0.25}
              roughness={0.3}
            />
          </mesh>
        </group>
      </group>

      {/* ---- Clavier + souris ---- */}
      <group name="keyboard">
        <mesh position={[0, 0.09, 0.35]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 0.05, 0.34]} />
          <meshStandardMaterial color={palette.device} roughness={0.7} />
        </mesh>
        <mesh position={[0.78, 0.09, 0.38]} castShadow>
          <boxGeometry args={[0.16, 0.05, 0.24]} />
          <meshStandardMaterial color={palette.device} roughness={0.7} />
        </mesh>
      </group>

      {/* ---- Téléphone (→ Apps mobiles) ---- */}
      <group name="phone" position={[1.02, 0, 0.15]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 0.28, 0]} rotation={[-0.18, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.03]} />
          <meshStandardMaterial
            color={palette.deviceDark}
            emissive={palette.screenGlow}
            emissiveIntensity={0.12}
            roughness={0.35}
          />
        </mesh>
      </group>

      {/* ---- Pile de livres (→ Coaching / Blog) ---- */}
      <group name="books" position={[-1.15, 0, -0.2]}>
        <mesh position={[0, 0.14, 0]} rotation={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.72, 0.11, 0.52]} />
          <meshStandardMaterial color={palette.book1} roughness={0.8} />
        </mesh>
        <mesh position={[0.02, 0.25, 0.01]} rotation={[0, -0.1, 0]} castShadow>
          <boxGeometry args={[0.68, 0.1, 0.48]} />
          <meshStandardMaterial color={palette.book2} roughness={0.8} />
        </mesh>
        <mesh position={[-0.01, 0.345, -0.01]} rotation={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.62, 0.09, 0.46]} />
          <meshStandardMaterial color={palette.book3} roughness={0.8} />
        </mesh>
      </group>

      {/* ---- Mug (→ Réseaux sociaux) ---- */}
      <group name="mug" position={[-0.65, 0, 0.35]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.11, 0.28, 24]} />
          <meshStandardMaterial color={palette.mug} roughness={0.6} />
        </mesh>
        <mesh position={[0.16, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.07, 0.022, 12, 24]} />
          <meshStandardMaterial color={palette.mug} roughness={0.6} />
        </mesh>
      </group>

      {/* ---- Plante (décor / Réseaux) ---- */}
      <group name="plant" position={[1.2, 0, -0.5]}>
        <mesh position={[0, 0.19, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.12, 0.26, 20]} />
          <meshStandardMaterial color={palette.plantPot} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.44, 0]} castShadow>
          <icosahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color={palette.plant} roughness={0.9} flatShading />
        </mesh>
      </group>
    </group>
  );
}
