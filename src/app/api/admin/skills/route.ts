import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  iconName: z.string().default(""),
  category: z.enum(["frontend", "backend", "devops", "tools"]),
  order: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const skills = await prisma.skill.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });
  return NextResponse.json(skills);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const skill = await prisma.skill.create({
    data: {
      ...parsed.data,
      order: parsed.data.order ?? 0,
      published: parsed.data.published ?? true,
    },
  });

  return NextResponse.json(skill, { status: 201 });
}
