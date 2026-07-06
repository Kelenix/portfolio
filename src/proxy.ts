import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) return false;

  const isHttps = request.nextUrl.protocol === "https:";
  const candidates = isHttps
    ? [
        "__Secure-authjs.session-token",
        "__Secure-next-auth.session-token",
        "authjs.session-token",
        "next-auth.session-token",
      ]
    : ["authjs.session-token", "next-auth.session-token"];

  for (const cookieName of candidates) {
    if (!request.cookies.get(cookieName)?.value) continue;
    try {
      const token = await getToken({
        req: request,
        secret,
        cookieName,
        secureCookie: cookieName.startsWith("__Secure-"),
      });
      if (token) return true;
    } catch {
      /* try next candidate */
    }
  }
  return false;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    const ok = await isAuthenticated(request);
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Routes de métadonnées Next servies à la racine sans extension (favicon
  // dynamique /icon, etc.). Sans ça, le middleware i18n les redirige vers
  // /fr/icon et renvoie un 404.
  if (pathname === "/icon" || pathname.startsWith("/icon/")) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
    "/",
    "/(fr|en|it)/:path*",
  ],
};
