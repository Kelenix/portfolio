import { prisma } from "./db";

export type AuditAction =
  | "login.success"
  | "login.failure"
  | "login.locked"
  | "admin.mutation";

export type AuditEntry = {
  action: AuditAction;
  actorEmail?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        actorEmail: entry.actorEmail ?? null,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : "",
      },
    });
  } catch (err) {
    console.error("[audit] failed to log entry", err);
  }
}

export function extractClientIp(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return null;
}
