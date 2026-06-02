import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apps = await prisma.mobileApp.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(apps);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const app = await prisma.mobileApp.create({ data: body });
  return NextResponse.json(app, { status: 201 });
}
