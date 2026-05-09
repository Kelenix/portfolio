import { prisma } from "@/lib/db";
import { MessagesClient } from "./MessagesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return <MessagesClient initialMessages={messages} />;
}
