import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  titleFr: z.string().min(1),
  titleEn: z.string().min(1),
  titleIt: z.string().min(1),
  contentFr: z.string().default(""),
  contentEn: z.string().default(""),
  contentIt: z.string().default(""),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug: lettres minuscules, chiffres et tirets uniquement"),
  published: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const published = parsed.data.published ?? false;
  const post = await prisma.blogPost.create({
    data: {
      ...parsed.data,
      published,
      publishedAt: published ? parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date() : null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
