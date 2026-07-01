import { randomBytes } from "crypto";
import { cookies } from "next/headers";

export const VISITOR_COOKIE = "chat_visitor_id";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function generateVisitorId(): string {
  return randomBytes(16).toString("hex");
}

export async function readVisitorId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(VISITOR_COOKIE)?.value ?? null;
}

export async function ensureVisitorId(): Promise<{
  id: string;
  created: boolean;
}> {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE)?.value;
  if (existing) return { id: existing, created: false };
  const id = generateVisitorId();
  jar.set({
    name: VISITOR_COOKIE,
    value: id,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  });
  return { id, created: true };
}
