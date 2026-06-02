import { prisma } from "@/lib/db";
import { FooterClient } from "./FooterClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Footer" };

export default async function AdminFooterPage() {
  const links = await prisma.footerLink.findMany({
    orderBy: [{ column: "asc" }, { order: "asc" }],
  });
  return <FooterClient initialLinks={links} />;
}
