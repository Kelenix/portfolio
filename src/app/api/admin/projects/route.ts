import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  titleFr: z.string().min(1),
  titleEn: z.string().min(1),
  titleIt: z.string().min(1),
  descFr: z.string().min(1),
  descEn: z.string().min(1),
  descIt: z.string().min(1),
  url: z.string().nullable().optional(),
  github: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  tags: z.string().optional(),
  order: z.number().int().min(0).optional(),
  published: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      tags: parsed.data.tags ?? "[]",
      order: parsed.data.order ?? 0,
      published: parsed.data.published ?? true,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
