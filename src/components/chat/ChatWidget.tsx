"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, X, Send, Loader2, User, Bot, UserPlus } from "lucide-react";

type Sender = "visitor" | "admin" | "bot";
type ConversationMode = "bot" | "wait_human" | "human" | "closed";

type Message = {
  id: string;
  sender: Sender;
  body: string;
  createdAt: string;
};

const POLL_INTERVAL_MS = 3000;

export const OPEN_CHAT_EVENT = "chat:open";
export const UNREAD_CHAT_EVENT = "chat:unread";

function dispatchUnread(count: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(UNREAD_CHAT_EVENT, { detail: { count } })
    );
  }
}

type Props = {
  avatarUrl?: string | null;
  adminName?: string | null;
};

export function ChatWidget({ avatarUrl, adminName }: Props = {}) {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mode, setMode] = useState<ConversationMode>("bot");
  const [escalating, setEscalating] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const lastSeenRef = useRef<number>(0);

  const openWidget = () => {
    setOpen(true);
    setUnreadCount(0);
    dispatchUnread(0);
  };

  useEffect(() => {
    const onOpen = () => openWidget();
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const params = new URLSearchParams();
        if (lastSeenRef.current) params.set("since", String(lastSeenRef.current));
        if (open) params.set("markRead", "1");
        const url = `/api/chat/poll${params.toString() ? "?" + params : ""}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          messages: Message[];
          unreadCount: number;
          mode?: ConversationMode;
        };
        if (cancelled) return;
        if (data.mode) setMode(data.mode);
        if (data.messages.length > 0) {
          const lastCreated = data.messages.at(-1)?.createdAt;
          if (lastCreated) lastSeenRef.current = new Date(lastCreated).getTime();
          setMessages((prev) => {
            const known = new Set(prev.map((m) => m.id));
            const fresh = data.messages.filter((m) => !known.has(m.id));
            return fresh.length ? [...prev, ...fresh] : prev;
          });
        }
        setUnreadCount(data.unreadCount);
        dispatchUnread(data.unreadCount);
      } catch {
        /* silent — polling retries */
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [open]);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages.length]);

  const send = async () => {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: trimmed,
          visitorName: name.trim() || null,
          visitorEmail: email.trim() || null,
        }),
      });
      if (res.status === 429) {
        setError(t("rateLimited"));
        return;
      }
      if (!res.ok) {
        setError(t("error"));
        return;
      }
      const data = (await res.json()) as {
        message: Message;
        botReply: Message | null;
        mode: ConversationMode;
      };
      setMode(data.mode);
      const fresh: Message[] = [data.message];
      if (data.botReply) fresh.push(data.botReply);
      lastSeenRef.current = new Date(
        fresh.at(-1)?.createdAt ?? data.message.createdAt
      ).getTime();
      setMessages((prev) => {
        const known = new Set(prev.map((m) => m.id));
        const added = fresh.filter((m) => !known.has(m.id));
        return added.length ? [...prev, ...added] : prev;
      });
      setBody("");
    } catch {
      setError(t("error"));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const escalate = async () => {
    if (escalating) return;
    setEscalating(true);
    try {
      const res = await fetch("/api/chat/escalate", { method: "POST" });
      if (!res.ok) return;
      setMode("wait_human");
    } catch {
      /* silent */
    } finally {
      setEscalating(false);
    }
  };

  const canEscalate = mode === "bot" || mode === "closed";

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label={t("openLabel")}
          onClick={openWidget}
          className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          style={{
            background: "var(--foreground)",
            color: "var(--background)",
            border: "1px solid var(--border)",
          }}
        >
          <MessageCircle size={20} strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-mono font-bold"
              style={{ background: "#ef4444", color: "white" }}
              aria-label={`${unreadCount} nouveau${unreadCount > 1 ? "x" : ""}`}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-5 right-5 z-40 flex flex-col rounded-xl shadow-2xl overflow-hidden"
          style={{
            width: "min(360px, calc(100vw - 2.5rem))",
            height: "min(560px, calc(100vh - 2.5rem))",
            background: "var(--background)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="flex items-start justify-between gap-3 p-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={adminName ?? "Admin"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User
                    size={16}
                    strokeWidth={1.5}
                    style={{ color: "var(--muted-foreground)" }}
                  />
                )}
                <span
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                  style={{
                    background: "#22c55e",
                    borderColor: "var(--background)",
                  }}
                  aria-hidden
                />
              </div>
              <div className="min-w-0">
                <p
                  className="text-sm font-mono font-bold truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {t("title")}
                </p>
                <p
                  className="text-[11px] font-mono mt-0.5"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {t("subtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label={t("close")}
              onClick={() => setOpen(false)}
              style={{ color: "var(--muted-foreground)" }}
            >
              <X size={18} />
            </button>
          </div>

          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ background: "var(--muted)" }}
          >
            {messages.length === 0 && (
              <p
                className="text-xs text-center py-6"
                style={{ color: "var(--muted-foreground)" }}
              >
                {t("empty")}
              </p>
            )}
            {messages.map((m) => {
              const isVisitor = m.sender === "visitor";
              const isBot = m.sender === "bot";
              const labelName = isVisitor
                ? t("you")
                : isBot
                  ? t("bot")
                  : adminName ?? t("me");
              return (
                <div
                  key={m.id}
                  className={`flex gap-2 ${isVisitor ? "justify-end" : "justify-start"}`}
                >
                  {!isVisitor && (
                    <div
                      className="w-7 h-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center mt-4"
                      style={{
                        background: "var(--muted)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {isBot ? (
                        <Bot
                          size={12}
                          strokeWidth={1.5}
                          style={{ color: "var(--muted-foreground)" }}
                        />
                      ) : avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt={adminName ?? "Admin"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User
                          size={12}
                          strokeWidth={1.5}
                          style={{ color: "var(--muted-foreground)" }}
                        />
                      )}
                    </div>
                  )}
                  <div
                    className={`flex flex-col max-w-[75%] ${isVisitor ? "items-end" : "items-start"}`}
                  >
                    <span
                      className="text-[10px] font-mono mb-0.5"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {labelName}
                    </span>
                    <div
                      className="px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                      style={{
                        background: isVisitor
                          ? "var(--foreground)"
                          : isBot
                            ? "var(--muted)"
                            : "var(--background)",
                        color: isVisitor
                          ? "var(--background)"
                          : "var(--foreground)",
                        border: isBot
                          ? "1px dashed var(--border)"
                          : "1px solid var(--border)",
                        overflowWrap: "anywhere",
                        wordBreak: "normal",
                      }}
                    >
                      {m.body}
                    </div>
                  </div>
                </div>
              );
            })}

            {mode === "wait_human" && (
              <p
                className="text-[11px] font-mono text-center py-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                {t("waitingHuman")}
              </p>
            )}
          </div>

          <div
            className="p-3 border-t space-y-2"
            style={{ borderColor: "var(--border)", background: "var(--background)" }}
          >
            {messages.length === 0 && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  className="px-2 py-1.5 text-xs rounded border outline-none"
                  style={{
                    background: "var(--muted)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="px-2 py-1.5 text-xs rounded border outline-none"
                  style={{
                    background: "var(--muted)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
            )}

            {canEscalate && messages.length > 0 && (
              <button
                type="button"
                onClick={escalate}
                disabled={escalating}
                className="flex items-center gap-1.5 text-[11px] font-mono transition-opacity hover:opacity-70 disabled:opacity-50"
                style={{ color: "var(--muted-foreground)" }}
              >
                {escalating ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <UserPlus size={11} strokeWidth={1.5} />
                )}
                {t("talkToHuman")}
              </button>
            )}

            {error && (
              <p className="text-[11px] text-red-500 font-mono">{error}</p>
            )}

            <div className="flex items-end gap-2">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder={t("inputPlaceholder")}
                className="flex-1 px-2 py-1.5 text-sm rounded border outline-none resize-none"
                style={{
                  background: "var(--muted)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
              <button
                type="button"
                onClick={send}
                disabled={sending || !body.trim()}
                aria-label={t("send")}
                className="w-9 h-9 flex items-center justify-center rounded transition-opacity disabled:opacity-40"
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
        </div>
      )}
    </>
  );
}
