import { prisma } from "@/lib/db";
import { ChatbotClient } from "./ChatbotClient";

export const dynamic = "force-dynamic";

export default async function ChatbotAdminPage() {
  const entries = await prisma.faqEntry.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return <ChatbotClient initialEntries={entries.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }))} />;
}
