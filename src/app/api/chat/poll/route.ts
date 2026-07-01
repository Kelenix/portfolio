import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readVisitorId } from "@/lib/chat";

export async function GET(req: NextRequest) {
  const visitorId = await readVisitorId();
  if (!visitorId) {
    return NextResponse.json({ messages: [], conversationId: null });
  }

  const conversation = await prisma.chatConversation.findUnique({
    where: { visitorId },
  });
  if (!conversation) {
    return NextResponse.json({ messages: [], conversationId: null });
  }

  const url = new URL(req.url);
  const sinceParam = url.searchParams.get("since");
  const since = sinceParam ? new Date(Number(sinceParam)) : null;

  const messages = await prisma.chatMessage.findMany({
    where: {
      conversationId: conversation.id,
      ...(since && !Number.isNaN(since.getTime())
        ? { createdAt: { gt: since } }
        : {}),
    },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: {
      id: true,
      sender: true,
      body: true,
      createdAt: true,
    },
  });

  if (messages.some((m) => m.sender === "admin")) {
    await prisma.chatMessage.updateMany({
      where: {
        conversationId: conversation.id,
        sender: "admin",
        readByVisitor: false,
      },
      data: { readByVisitor: true },
    });
  }

  return NextResponse.json({
    conversationId: conversation.id,
    status: conversation.status,
    messages,
  });
}
