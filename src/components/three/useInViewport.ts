"use client";

import { useEffect, useState } from "react";

/**
 * Observe un élément et indique s'il est dans le viewport. Sert à couper le
 * rendu des canvas 3D (frameloop) quand ils sont hors écran → économie CPU/GPU.
 *
 * Utilise un callback ref pour rester fiable même si l'élément est monté de
 * façon conditionnelle (ex. gate md+ des canvas).
 */
export function useInViewport<T extends Element>() {
  const [inView, setInView] = useState(true);
  const [node, setNode] = useState<T | null>(null);

  useEffect(() => {
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "150px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [node]);

  return { ref: setNode, inView };
}
