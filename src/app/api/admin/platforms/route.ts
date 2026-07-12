import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const platforms = await prisma.platform.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(platforms);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const platform = await prisma.platform.create({ data: body });
  return NextResponse.json(platform, { status: 201 });
}
