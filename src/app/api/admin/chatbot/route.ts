import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  questionFr: z.string().min(1).max(500),
  questionEn: z.string().min(1).max(500),
  questionIt: z.string().min(1).max(500),
  answerFr: z.string().min(1).max(4000),
  answerEn: z.string().min(1).max(4000),
  answerIt: z.string().min(1).max(4000),
  keywords: z.string().max(1000).default(""),
  order: z.number().int().default(0),
  published: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await prisma.faqEntry.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const entry = await prisma.faqEntry.create({ data: parsed.data });
  return NextResponse.json(entry, { status: 201 });
}
