import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { headers } from "next/headers";
import { checkAndConsume, resetKey } from "./rate-limit";
import { logAudit, extractClientIp } from "./audit";

const loginSchema = z.object({
  identifier: z.string().min(1).max(200),
  password: z.string().min(1).max(200),
});

const LOGIN_RATE_LIMIT = { max: 5, windowMs: 15 * 60_000, lockMs: 15 * 60_000 };

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        identifier: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        let ip: string | null = null;
        let userAgent: string | null = null;
        try {
          const h = await headers();
          ip = extractClientIp(h);
          userAgent = h.get("user-agent");
        } catch {
          /* headers unavailable in some contexts */
        }

        const key = `login:${ip ?? "unknown"}`;
        const gate = checkAndConsume(key, LOGIN_RATE_LIMIT);
        if (!gate.ok) {
          await logAudit({
            action: "login.locked",
            actorEmail: parsed.data.identifier,
            ip,
            userAgent,
            metadata: { retryAfterSec: gate.retryAfterSec },
          });
          throw new Error(`RATE_LIMITED:${gate.retryAfterSec}`);
        }

        const identifier = parsed.data.identifier.trim();
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }],
          },
        });

        if (!user) {
          await logAudit({
            action: "login.failure",
            actorEmail: identifier,
            ip,
            userAgent,
            metadata: { reason: "user_not_found" },
          });
          return null;
        }

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) {
          await logAudit({
            action: "login.failure",
            actorEmail: user.email,
            ip,
            userAgent,
            metadata: { reason: "bad_password" },
          });
          return null;
        }

        resetKey(key);
        await logAudit({
          action: "login.success",
          actorEmail: user.email,
          ip,
          userAgent,
        });

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
