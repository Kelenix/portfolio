import { prisma } from "@/lib/db";
import { MobileAppsClient } from "./MobileAppsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Apps mobiles" };

export default async function AdminMobileAppsPage() {
  const apps = await prisma.mobileApp.findMany({ orderBy: { order: "asc" } });
  return <MobileAppsClient initialApps={apps} />;
}
