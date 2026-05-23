import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      titleFr: true,
      titleEn: true,
      titleIt: true,
      slug: true,
      publishedAt: true,
      createdAt: true,
    },
  });
  return NextResponse.json(posts);
}
