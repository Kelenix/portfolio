import { prisma } from "@/lib/db";
import { ChatListClient } from "./ChatListClient";

export const dynamic = "force-dynamic";

export default async function ChatListPage() {
  const conversations = await prisma.chatConversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          messages: { where: { sender: "visitor", readByAdmin: false } },
        },
      },
    },
  });

  const initial = conversations.map((c) => ({
    id: c.id,
    visitorName: c.visitorName,
    visitorEmail: c.visitorEmail,
    status: c.status,
    mode: c.mode,
    lastMessageAt: c.lastMessageAt.toISOString(),
    lastMessage: c.messages[0]
      ? {
          sender: c.messages[0].sender,
          body: c.messages[0].body,
          createdAt: c.messages[0].createdAt.toISOString(),
        }
      : null,
    unread: c._count.messages,
  }));

  return <ChatListClient initial={initial} />;
}
