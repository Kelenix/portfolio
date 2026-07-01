import type { NewMessagePayload, NotificationChannel } from "./channel";

const API_BASE = "https://api.telegram.org";

function escape(text: string): string {
  return text.replace(/[<>&]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;"
  );
}

function truncate(text: string, max = 1000): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + "…";
}

function formatMessage(payload: NewMessagePayload): string {
  const lines: string[] = [];
  lines.push("<b>Nouveau message chat</b>");
  const identity = [payload.visitorName, payload.visitorEmail]
    .filter(Boolean)
    .join(" · ");
  if (identity) lines.push(escape(identity));
  lines.push("");
  lines.push(escape(truncate(payload.body)));
  lines.push("");
  lines.push(`<a href="${payload.adminUrl}">Ouvrir la conversation</a>`);
  return lines.join("\n");
}

export const telegramChannel: NotificationChannel = {
  name: "telegram",

  isAvailable() {
    return Boolean(
      process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID
    );
  },

  async sendNewMessage(payload) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    const url = `${API_BASE}/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatMessage(payload),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Telegram sendMessage failed (${res.status}): ${text}`);
    }
  },
};
