import { prisma } from "@/lib/db";
import { AccomplishmentsClient } from "./AccomplishmentsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Accomplissements" };

export default async function AdminAccomplishmentsPage() {
  const items = await prisma.accomplishment.findMany({ orderBy: { order: "asc" } });
  return <AccomplishmentsClient initialItems={items} />;
}
