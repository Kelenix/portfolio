"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Le canvas 3D est chargé uniquement côté client, à la demande. Il ne fait
// donc jamais partie du bundle du premier rendu serveur (SEO/LCP intacts).
const DeskCanvas = dynamic(() => import("./InteractiveDeskCanvas"), {
  ssr: false,
  loading: () => <DeskSkeleton />,
});

function DeskSkeleton() {
  return (
    <div
      className="h-full w-full animate-pulse rounded-2xl"
      style={{ background: "var(--muted)" }}
      aria-hidden
    />
  );
}

export function InteractiveDesk() {
  // On ne monte le canvas qu'à partir de md (>=768px) : sur mobile le Hero
  // texte suffit et on évite le coût 3D sur petits appareils.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!enabled) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 pb-4" aria-label="Bureau interactif 3D">
      <div className="relative h-[440px] w-full">
        <DeskCanvas />
      </div>
    </section>
  );
}
