import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ChatConversationClient } from "./ChatConversationClient";

export const dynamic = "force-dynamic";

export default async function AdminChatConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const conversation = await prisma.chatConversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) notFound();

  await prisma.chatMessage.updateMany({
    where: { conversationId: id, sender: "visitor", readByAdmin: false },
    data: { readByAdmin: true },
  });

  return (
    <ChatConversationClient
      conversation={{
        id: conversation.id,
        visitorName: conversation.visitorName,
        visitorEmail: conversation.visitorEmail,
        status: conversation.status,
        createdAt: conversation.createdAt.toISOString(),
      }}
      initialMessages={conversation.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  );
}
