import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readVisitorId } from "@/lib/chat";
import { notifyNewMessage } from "@/lib/notifications";
import { getSiteUrl } from "@/lib/seo";
import {
  ESCALATION_MESSAGES,
  botLocaleFromAcceptLanguage,
} from "@/lib/chatbot";

export async function POST(req: NextRequest) {
  const visitorId = await readVisitorId();
  if (!visitorId) {
    return NextResponse.json({ error: "No conversation" }, { status: 404 });
  }

  const conversation = await prisma.chatConversation.findUnique({
    where: { visitorId },
  });
  if (!conversation) {
    return NextResponse.json({ error: "No conversation" }, { status: 404 });
  }

  const locale = botLocaleFromAcceptLanguage(req.headers.get("accept-language"));

  if (conversation.mode === "bot" || conversation.mode === "closed") {
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { mode: "wait_human", status: "open", lastMessageAt: new Date() },
    });

    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        sender: "bot",
        body: ESCALATION_MESSAGES[locale],
        readByAdmin: true,
      },
    });
  }

  const adminUrl = `${getSiteUrl()}/admin/chat/${conversation.id}`;
  notifyNewMessage({
    conversationId: conversation.id,
    visitorName: conversation.visitorName,
    visitorEmail: conversation.visitorEmail,
    body: "[Transfert humain demandé par le visiteur]",
    adminUrl,
  }).catch((e) => console.error("[chat] escalate notify failed", e));

  return NextResponse.json({ ok: true, mode: "wait_human" });
}
