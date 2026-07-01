import type { NewMessagePayload, NotificationChannel } from "./channel";
import { telegramChannel } from "./telegram";

const ALL_CHANNELS: NotificationChannel[] = [telegramChannel];

export function enabledChannels(): NotificationChannel[] {
  return ALL_CHANNELS.filter((c) => c.isAvailable());
}

export async function notifyNewMessage(payload: NewMessagePayload): Promise<void> {
  const channels = enabledChannels();
  if (channels.length === 0) {
    console.warn(
      "[notifications] no channel enabled — set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID"
    );
    return;
  }

  await Promise.all(
    channels.map(async (ch) => {
      try {
        await ch.sendNewMessage(payload);
      } catch (err) {
        console.error(`[notifications:${ch.name}] failed`, err);
      }
    })
  );
}

export type { NewMessagePayload, NotificationChannel };
