import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  return NextResponse.json({
    conversations: conversations.map((c) => ({
      id: c.id,
      visitorName: c.visitorName,
      visitorEmail: c.visitorEmail,
      status: c.status,
      lastMessageAt: c.lastMessageAt,
      lastMessage: c.messages[0]
        ? {
            sender: c.messages[0].sender,
            body: c.messages[0].body,
            createdAt: c.messages[0].createdAt,
          }
        : null,
      unread: c._count.messages,
    })),
  });
}
