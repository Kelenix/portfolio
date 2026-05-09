import { prisma } from "@/lib/db";
import { SettingsClient } from "./SettingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Paramètres" };

export default async function AdminSettingsPage() {
  const profile = await prisma.profile.findFirst({ where: { id: "default" } });
  return <SettingsClient profile={profile} />;
}
