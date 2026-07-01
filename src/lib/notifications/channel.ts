export type NewMessagePayload = {
  conversationId: string;
  visitorName?: string | null;
  visitorEmail?: string | null;
  body: string;
  adminUrl: string;
};

export interface NotificationChannel {
  name: string;
  isAvailable(): boolean;
  sendNewMessage(payload: NewMessagePayload): Promise<void>;
}
