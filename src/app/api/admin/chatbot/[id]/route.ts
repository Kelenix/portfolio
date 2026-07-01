import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const patchSchema = z.object({
  questionFr: z.string().min(1).max(500).optional(),
  questionEn: z.string().min(1).max(500).optional(),
  questionIt: z.string().min(1).max(500).optional(),
  answerFr: z.string().min(1).max(4000).optional(),
  answerEn: z.string().min(1).max(4000).optional(),
  answerIt: z.string().min(1).max(4000).optional(),
  keywords: z.string().max(1000).optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

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
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const entry = await prisma.faqEntry.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(entry);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.faqEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
