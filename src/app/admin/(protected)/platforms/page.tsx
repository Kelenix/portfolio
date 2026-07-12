import { prisma } from "@/lib/db";
import { PlatformsClient } from "./PlatformsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Plateformes" };

export default async function AdminPlatformsPage() {
  // Résilient : si la table n'existe pas encore (avant `db push`) ou DB
  // injoignable, on démarre sur une liste vide plutôt que planter.
  const platforms = await prisma.platform
    .findMany({ orderBy: { order: "asc" } })
    .catch(() => []);
  return <PlatformsClient initialPlatforms={platforms} />;
}
