// Petites fonctions d'easing / interpolation pour l'animation d'entrée du bureau.

export function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function vlerp(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

// Rebond léger en fin de course (effet « pop »).
export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Décélération douce, sans dépassement (pour le tracé des lignes).
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Multiplicateur d'échelle pour l'effet « press » au clic : l'objet se comprime
// puis rebondit. Renvoie 1 hors de la fenêtre d'animation.
export function clickPulse(dt: number): number {
  const DUR = 0.4;
  const DOWN = 0.1;
  if (dt < 0 || dt > DUR) return 1;
  if (dt < DOWN) return 1 - 0.15 * (dt / DOWN); // 1 → 0.85
  const p = (dt - DOWN) / (DUR - DOWN);
  return 0.85 + 0.15 * easeOutBack(p); // 0.85 → ~1 avec léger dépassement
}
