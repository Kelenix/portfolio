import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const replySchema = z.object({
  body: z.string().min(1).max(4000),
});

const patchSchema = z.object({
  status: z.enum(["open", "closed"]).optional(),
  mode: z.enum(["bot", "wait_human", "human", "closed"]).optional(),
  markRead: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const url = new URL(req.url);
  const sinceParam = url.searchParams.get("since");
  const since = sinceParam ? new Date(Number(sinceParam)) : null;

  const conversation = await prisma.chatConversation.findUnique({
    where: { id },
    include: {
      messages: {
        where:
          since && !Number.isNaN(since.getTime())
            ? { createdAt: { gt: since } }
            : undefined,
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      visitorName: conversation.visitorName,
      visitorEmail: conversation.visitorEmail,
      status: conversation.status,
      mode: conversation.mode,
      createdAt: conversation.createdAt,
      lastMessageAt: conversation.lastMessageAt,
    },
    messages: conversation.messages.map((m) => ({
      id: m.id,
      sender: m.sender,
      body: m.body,
      createdAt: m.createdAt,
    })),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const conversation = await prisma.chatConversation.findUnique({ where: { id } });
  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [message] = await prisma.$transaction([
    prisma.chatMessage.create({
      data: {
        conversationId: id,
        sender: "admin",
        body: parsed.data.body.trim(),
        readByAdmin: true,
      },
    }),
    prisma.chatConversation.update({
      where: { id },
      data: {
        lastMessageAt: new Date(),
        status: "open",
        mode: "human",
      },
    }),
  ]);

  return NextResponse.json({
    message: {
      id: message.id,
      sender: message.sender,
      body: message.body,
      createdAt: message.createdAt,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  if (parsed.data.markRead) {
    await prisma.chatMessage.updateMany({
      where: { conversationId: id, sender: "visitor", readByAdmin: false },
      data: { readByAdmin: true },
    });
  }

  if (parsed.data.status || parsed.data.mode) {
    await prisma.chatConversation.update({
      where: { id },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.mode ? { mode: parsed.data.mode } : {}),
      },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.chatConversation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
