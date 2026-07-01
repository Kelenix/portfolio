"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ConversationSummary = {
  id: string;
  visitorName: string | null;
  visitorEmail: string | null;
  status: string;
  mode: string;
  lastMessageAt: string;
  lastMessage: { sender: string; body: string; createdAt: string } | null;
  unread: number;
};

const MODE_BADGE: Record<string, { label: string; color: string }> = {
  bot: { label: "Bot", color: "#6b7280" },
  wait_human: { label: "Attente humain", color: "#f97316" },
  human: { label: "Humain", color: "#22c55e" },
  closed: { label: "Fermée", color: "var(--muted-foreground)" },
};

const POLL_MS = 5000;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function truncate(text: string, max = 80): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

export function ChatListClient({
  initial,
}: {
  initial: ConversationSummary[];
}) {
  const [conversations, setConversations] = useState(initial);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/chat", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { conversations: ConversationSummary[] };
        setConversations(data.conversations);
      } catch {
        /* silent */
      }
    };
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1
          className="text-xl font-mono font-bold"
          style={{ color: "var(--foreground)" }}
        >
          Chat
        </h1>
        <p
          className="text-xs font-mono"
          style={{ color: "var(--muted-foreground)" }}
        >
          {conversations.length} conversation{conversations.length > 1 ? "s" : ""}
          {totalUnread > 0 ? ` · ${totalUnread} non lu${totalUnread > 1 ? "s" : ""}` : ""}
        </p>
      </div>

      {conversations.length === 0 ? (
        <p
          className="text-sm font-mono py-12 text-center"
          style={{ color: "var(--muted-foreground)" }}
        >
          Aucune conversation.
        </p>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => {
            const identity =
              c.visitorName || c.visitorEmail || `Visiteur ${c.id.slice(0, 6)}`;
            return (
              <Link
                key={c.id}
                href={`/admin/chat/${c.id}`}
                className="block p-4 rounded-lg border transition-opacity hover:opacity-80"
                style={{
                  background: c.unread > 0 ? "var(--background)" : "var(--muted)",
                  borderColor: c.unread > 0 ? "var(--accent)" : "var(--border)",
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <p
                      className="text-sm font-mono font-semibold truncate"
                      style={{ color: "var(--foreground)" }}
                    >
                      {identity}
                    </p>
                    {c.unread > 0 && (
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: "var(--accent)", color: "white" }}
                      >
                        {c.unread} non lu{c.unread > 1 ? "s" : ""}
                      </span>
                    )}
                    {(() => {
                      const meta = MODE_BADGE[c.mode] ?? MODE_BADGE.human;
                      return (
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                          style={{
                            borderColor: `${meta.color}55`,
                            color: meta.color,
                          }}
                        >
                          {meta.label}
                        </span>
                      );
                    })()}
                  </div>
                  <span
                    className="text-[11px] font-mono shrink-0"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {formatDate(c.lastMessageAt)}
                  </span>
                </div>
                {c.lastMessage && (
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {c.lastMessage.sender === "admin" ? "→ " : "← "}
                    {truncate(c.lastMessage.body)}
                  </p>
                )}
                {c.visitorEmail && (
                  <p
                    className="text-[11px] font-mono mt-0.5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {c.visitorEmail}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
