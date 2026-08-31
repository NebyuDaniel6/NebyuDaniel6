import type {
  AppNotification,
  NotificationPreferences,
  NotificationType,
  Person,
} from "./types";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  importantDates: true,
  orderUpdates: true,
  deliveryUpdates: true,
  subscriptionReminders: true,
  promotional: false,
};

export function canSend(
  type: NotificationType,
  preferences: NotificationPreferences,
) {
  switch (type) {
    case "important_date":
      return preferences.importantDates;
    case "order_update":
      return preferences.orderUpdates;
    case "delivery_update":
      return preferences.deliveryUpdates;
    case "subscription":
      return preferences.subscriptionReminders;
    case "promotional":
      return preferences.promotional;
  }
}

export function reminderCopy(person: Person, days: number) {
  if (days === 7) {
    return {
      title: `${person.name}'s birthday is next week.`,
      body: "We've picked three bouquets we'd recommend.",
      actionLabel: "See flowers",
    };
  }
  if (days === 1) {
    return {
      title: `Tomorrow is ${person.name}'s birthday.`,
      body: "Still time to make her day.",
      actionLabel: "Send flowers",
    };
  }
  if (days === 0) {
    return {
      title: `Today is ${person.name}'s birthday.`,
      body: "A bouquet still arrives this evening.",
      actionLabel: "Send flowers",
    };
  }
  return {
    title: `${person.name}'s birthday is in ${days} days.`,
    body: "We picked something beautiful for her.",
    actionLabel: "See flowers",
  };
}

export function createNotification(
  partial: Omit<AppNotification, "id" | "createdAt">,
): AppNotification {
  return {
    ...partial,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
}

export interface PushAdapter {
  send(token: string, title: string, body: string, data?: Record<string, string>): Promise<void>;
}

export class FirebaseCloudMessagingAdapter implements PushAdapter {
  constructor(private serverKey?: string) {}

  async send() {
    if (!this.serverKey) return;
  }
}
