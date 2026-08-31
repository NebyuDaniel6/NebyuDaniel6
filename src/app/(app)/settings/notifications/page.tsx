"use client";

import { useState } from "react";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/domain/notifications";
import { useI18n } from "@/i18n";

export default function NotificationSettingsPage() {
  const { t } = useI18n();
  const [prefs, setPrefs] = useState(DEFAULT_NOTIFICATION_PREFERENCES);

  const rows = [
    ["importantDates", t.notifications.importantDates],
    ["orderUpdates", t.notifications.orderUpdates],
    ["deliveryUpdates", t.notifications.deliveryUpdates],
    ["subscriptionReminders", t.notifications.subscriptionReminders],
    ["promotional", t.notifications.promotional],
  ] as const;

  return (
    <div className="px-5 pt-8">
      <h1 className="font-display text-[34px]">{t.notifications.title}</h1>
      <div className="mt-6 divide-y divide-line overflow-hidden rounded-[24px] bg-paper">
        {rows.map(([key, label]) => (
          <label key={key} className="flex items-center justify-between px-4 py-4">
            <span>{label}</span>
            <input
              type="checkbox"
              checked={prefs[key]}
              onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
