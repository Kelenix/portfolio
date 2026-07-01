import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  "login.success": { label: "Connexion", color: "#22c55e" },
  "login.failure": { label: "Échec connexion", color: "#ef4444" },
  "login.locked": { label: "Verrouillé", color: "#f97316" },
  "admin.mutation": { label: "Action admin", color: "var(--accent)" },
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(d);
}

function parseMetadata(raw: string): string {
  if (!raw) return "";
  try {
    const obj = JSON.parse(raw);
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join(" · ");
  } catch {
    return raw;
  }
}

export default async function AuditPage() {
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1
        className="text-xl font-mono font-bold mb-2"
        style={{ color: "var(--foreground)" }}
      >
        Journal de sécurité
      </h1>
      <p
        className="text-xs font-mono mb-6"
        style={{ color: "var(--muted-foreground)" }}
      >
        Les 100 dernières entrées — connexions, échecs, verrouillages.
      </p>

      {entries.length === 0 ? (
        <p
          className="text-sm font-mono py-12 text-center"
          style={{ color: "var(--muted-foreground)" }}
        >
          Aucune entrée pour l&apos;instant.
        </p>
      ) : (
        <div
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <table className="w-full text-xs font-mono">
            <thead>
              <tr
                className="border-b"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--muted)",
                }}
              >
                <th className="text-left px-3 py-2" style={{ color: "var(--muted-foreground)" }}>
                  Date
                </th>
                <th className="text-left px-3 py-2" style={{ color: "var(--muted-foreground)" }}>
                  Action
                </th>
                <th className="text-left px-3 py-2" style={{ color: "var(--muted-foreground)" }}>
                  Acteur
                </th>
                <th className="text-left px-3 py-2" style={{ color: "var(--muted-foreground)" }}>
                  IP
                </th>
                <th className="text-left px-3 py-2" style={{ color: "var(--muted-foreground)" }}>
                  Détails
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const meta = ACTION_LABELS[e.action] ?? {
                  label: e.action,
                  color: "var(--muted-foreground)",
                };
                return (
                  <tr
                    key={e.id}
                    className="border-b"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="px-3 py-2" style={{ color: "var(--muted-foreground)" }}>
                      {formatDate(e.createdAt)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-block px-2 py-0.5 rounded"
                        style={{
                          background: "var(--muted)",
                          color: meta.color,
                          border: `1px solid ${meta.color}33`,
                        }}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-3 py-2" style={{ color: "var(--foreground)" }}>
                      {e.actorEmail ?? "—"}
                    </td>
                    <td className="px-3 py-2" style={{ color: "var(--muted-foreground)" }}>
                      {e.ip ?? "—"}
                    </td>
                    <td
                      className="px-3 py-2 truncate max-w-xs"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {parseMetadata(e.metadata)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
