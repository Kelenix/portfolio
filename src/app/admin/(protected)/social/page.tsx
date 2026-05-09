import { prisma } from "@/lib/db";
import { SocialClient } from "./SocialClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Réseaux sociaux" };

export default async function AdminSocialPage() {
  const socials = await prisma.socialLink.findMany({ orderBy: { order: "asc" } });
  return <SocialClient initialSocials={socials} />;
}
