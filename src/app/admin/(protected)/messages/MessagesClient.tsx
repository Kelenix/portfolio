"use client";

import { useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { useToast } from "@/components/admin/Toast";
import type { ContactMessage } from "@prisma/client";

export function MessagesClient({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const { toast } = useToast();

  const markRead = async (id: string, read: boolean) => {
    try {
      await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
    } catch {
      toast("error", "Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    try {
      await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast("success", "Message supprimé");
    } catch {
      toast("error", "Erreur");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-mono font-bold mb-6" style={{ color: "var(--foreground)" }}>
        Messages ({messages.filter((m) => !m.read).length} non lus)
      </h1>

      <div className="space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="p-5 rounded-lg border transition-all"
            style={{
              background: msg.read ? "var(--muted)" : "var(--background)",
              borderColor: msg.read ? "var(--border)" : "var(--accent)",
              opacity: msg.read ? 0.7 : 1,
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="text-sm font-mono font-semibold" style={{ color: "var(--foreground)" }}>
                  {msg.name}
                </p>
                <a
                  href={`mailto:${msg.email}`}
                  className="text-xs hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  {msg.email}
                </a>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                  {new Date(msg.createdAt).toLocaleDateString("fr-FR")}
                </span>
                <button
                  onClick={() => markRead(msg.id, !msg.read)}
                  className="p-1.5 transition-opacity hover:opacity-70"
                  style={{ color: "var(--muted-foreground)" }}
                  title={msg.read ? "Marquer non lu" : "Marquer lu"}
                >
                  {msg.read ? <Mail size={14} /> : <MailOpen size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="p-1.5 transition-opacity hover:opacity-70"
                  style={{ color: "#ef4444" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              {msg.message}
            </p>
          </div>
        ))}

        {messages.length === 0 && (
          <p className="text-sm font-mono text-center py-12" style={{ color: "var(--muted-foreground)" }}>
            Aucun message pour l&apos;instant.
          </p>
        )}
      </div>
    </div>
  );
}
