import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findFirst({ where: { id: "default" } });
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const profile = await prisma.profile.upsert({
    where: { id: "default" },
    update: body,
    create: { id: "default", ...body },
  });
  return NextResponse.json(profile);
}
