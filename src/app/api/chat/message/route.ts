import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ensureVisitorId } from "@/lib/chat";
import { notifyNewMessage } from "@/lib/notifications";
import { getSiteUrl } from "@/lib/seo";
import { checkAndConsume } from "@/lib/rate-limit";
import { extractClientIp } from "@/lib/audit";

const schema = z.object({
  body: z.string().min(1).max(4000),
  visitorName: z.string().max(100).optional().nullable(),
  visitorEmail: z.string().email().max(200).optional().nullable(),
});

const CHAT_RATE_LIMIT = { max: 20, windowMs: 5 * 60_000, lockMs: 5 * 60_000 };

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req.headers);
  const rl = checkAndConsume(`chat:${ip ?? "unknown"}`, CHAT_RATE_LIMIT);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de messages, réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { id: visitorId } = await ensureVisitorId();

  const conversation = await prisma.chatConversation.upsert({
    where: { visitorId },
    update: {
      lastMessageAt: new Date(),
      ...(parsed.data.visitorName
        ? { visitorName: parsed.data.visitorName }
        : {}),
      ...(parsed.data.visitorEmail
        ? { visitorEmail: parsed.data.visitorEmail }
        : {}),
    },
    create: {
      visitorId,
      visitorName: parsed.data.visitorName ?? null,
      visitorEmail: parsed.data.visitorEmail ?? null,
    },
  });

  const message = await prisma.chatMessage.create({
    data: {
      conversationId: conversation.id,
      sender: "visitor",
      body: parsed.data.body.trim(),
      readByVisitor: true,
    },
  });

  const adminUrl = `${getSiteUrl()}/admin/chat/${conversation.id}`;
  notifyNewMessage({
    conversationId: conversation.id,
    visitorName: conversation.visitorName,
    visitorEmail: conversation.visitorEmail,
    body: message.body,
    adminUrl,
  }).catch((e) => console.error("[chat] notify failed", e));

  return NextResponse.json({
    conversationId: conversation.id,
    message: {
      id: message.id,
      sender: message.sender,
      body: message.body,
      createdAt: message.createdAt,
    },
  });
}
