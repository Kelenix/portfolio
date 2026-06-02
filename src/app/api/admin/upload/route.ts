import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";
import { randomBytes } from "crypto";

const BUCKET = "avatars";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const folder = (formData.get("folder") as string | null)?.trim() || "";
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();

  const safeFolder = folder.replace(/[^a-z0-9-_/]/gi, "").replace(/^\/+|\/+$/g, "");
  const path = safeFolder
    ? `${safeFolder}/${randomBytes(8).toString("hex")}.${ext}`
    : `avatar.${ext}`;

  const bytes = await file.arrayBuffer();
  const supabase = getSupabaseClient();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, Buffer.from(bytes), {
      contentType: file.type,
      upsert: !safeFolder,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
