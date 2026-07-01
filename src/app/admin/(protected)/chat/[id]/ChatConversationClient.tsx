"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Loader2, Trash2, Archive, RefreshCw, Bot } from "lucide-react";
import { useToast } from "@/components/admin/Toast";

type Message = {
  id: string;
  sender: string;
  body: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  visitorName: string | null;
  visitorEmail: string | null;
  status: string;
  mode?: string;
  createdAt: string;
};

const POLL_MS = 2500;

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ChatConversationClient({
  conversation: initialConversation,
  initialMessages,
}: {
  conversation: Conversation;
  initialMessages: Message[];
}) {
  const [conversation, setConversation] = useState(initialConversation);
  const [messages, setMessages] = useState(initialMessages);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const lastSeenRef = useRef<number>(
    initialMessages.length
      ? new Date(initialMessages.at(-1)!.createdAt).getTime()
      : 0
  );
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const url = lastSeenRef.current
          ? `/api/admin/chat/${conversation.id}?since=${lastSeenRef.current}`
          : `/api/admin/chat/${conversation.id}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          conversation: Conversation;
          messages: Message[];
        };
        if (!lastSeenRef.current) {
          setMessages(data.messages);
        } else if (data.messages.length > 0) {
          setMessages((prev) => {
            const known = new Set(prev.map((m) => m.id));
            const fresh = data.messages.filter((m) => !known.has(m.id));
            return fresh.length ? [...prev, ...fresh] : prev;
          });
        }
        const last = data.messages.at(-1)?.createdAt;
        if (last) lastSeenRef.current = new Date(last).getTime();
        setConversation(data.conversation);
      } catch {
        /* silent */
      }
    };
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [conversation.id]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const send = async () => {
    const trimmed = reply.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/chat/${conversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { message: Message };
      setMessages((prev) =>
        prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]
      );
      lastSeenRef.current = new Date(data.message.createdAt).getTime();
      setReply("");
    } catch {
      toast("error", "Envoi impossible");
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (status: "open" | "closed") => {
    try {
      const res = await fetch(`/api/admin/chat/${conversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setConversation((prev) => ({ ...prev, status }));
      toast("success", status === "closed" ? "Conversation fermée" : "Rouverte");
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const setMode = async (mode: "bot" | "human") => {
    try {
      const res = await fetch(`/api/admin/chat/${conversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) throw new Error();
      setConversation((prev) => ({ ...prev, mode }));
      toast(
        "success",
        mode === "bot" ? "Bot réactivé sur cette conversation" : "Bot désactivé"
      );
    } catch {
      toast("error", "Une erreur est survenue");
    }
  };

  const remove = async () => {
    if (!confirm("Supprimer définitivement cette conversation ?")) return;
    try {
      const res = await fetch(`/api/admin/chat/${conversation.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      window.location.href = "/admin/chat";
    } catch {
      toast("error", "Suppression impossible");
    }
  };

  const identity =
    conversation.visitorName ||
    conversation.visitorEmail ||
    `Visiteur ${conversation.id.slice(0, 6)}`;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-3">
        <Link
          href="/admin/chat"
          className="flex items-center gap-1.5 text-xs font-mono hover:opacity-70"
          style={{ color: "var(--muted-foreground)" }}
        >
          <ArrowLeft size={12} /> Retour
        </Link>
        <div className="flex items-center gap-2">
          {conversation.mode !== "bot" && (
            <button
              onClick={() => setMode("bot")}
              className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded border hover:opacity-70"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              title="Le bot répondra au prochain message visiteur"
            >
              <Bot size={12} /> Réactiver le bot
            </button>
          )}
          {conversation.status === "closed" ? (
            <button
              onClick={() => setStatus("open")}
              className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded border hover:opacity-70"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              <RefreshCw size={12} /> Rouvrir
            </button>
          ) : (
            <button
              onClick={() => setStatus("closed")}
              className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded border hover:opacity-70"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              <Archive size={12} /> Fermer
            </button>
          )}
          <button
            onClick={remove}
            className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded border hover:opacity-70"
            style={{ borderColor: "var(--border)", color: "#ef4444" }}
          >
            <Trash2 size={12} /> Supprimer
          </button>
        </div>
      </div>

      <div
        className="flex items-center justify-between p-3 rounded-t-lg border border-b-0"
        style={{ background: "var(--muted)", borderColor: "var(--border)" }}
      >
        <div className="min-w-0">
          <p
            className="text-sm font-mono font-semibold truncate"
            style={{ color: "var(--foreground)" }}
          >
            {identity}
          </p>
          {conversation.visitorEmail && (
            <a
              href={`mailto:${conversation.visitorEmail}`}
              className="text-[11px] font-mono hover:underline"
              style={{ color: "var(--accent)" }}
            >
              {conversation.visitorEmail}
            </a>
          )}
        </div>
        <span
          className="text-[11px] font-mono"
          style={{ color: "var(--muted-foreground)" }}
        >
          Ouverte le {formatTime(conversation.createdAt)}
        </span>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 border"
        style={{ background: "var(--background)", borderColor: "var(--border)" }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[75%] ${m.sender === "admin" ? "items-end ml-auto" : "items-start mr-auto"}`}
          >
            <span
              className="text-[10px] font-mono mb-0.5"
              style={{ color: "var(--muted-foreground)" }}
            >
              {m.sender === "admin" ? "Vous" : identity} · {formatTime(m.createdAt)}
            </span>
            <div
              className="px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                background:
                  m.sender === "admin" ? "var(--foreground)" : "var(--muted)",
                color:
                  m.sender === "admin"
                    ? "var(--background)"
                    : "var(--foreground)",
                border: "1px solid var(--border)",
                overflowWrap: "anywhere",
                wordBreak: "normal",
              }}
            >
              {m.body}
            </div>
          </div>
        ))}
      </div>

      <div
        className="p-3 rounded-b-lg border border-t-0 flex items-end gap-2"
        style={{ background: "var(--muted)", borderColor: "var(--border)" }}
      >
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="Votre réponse…"
          className="flex-1 px-2 py-1.5 text-sm rounded border outline-none resize-none"
          style={{
            background: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !reply.trim()}
          className="w-9 h-9 flex items-center justify-center rounded disabled:opacity-40"
          style={{
            background: "var(--foreground)",
            color: "var(--background)",
          }}
        >
          {sending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>
    </div>
  );
}
