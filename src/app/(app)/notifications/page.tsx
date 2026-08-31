"use client";

import Link from "next/link";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";

export default function NotificationsPage() {
  const { t } = useI18n();
  const notifications = useAbebaStore((s) => s.notifications);
  const markRead = useAbebaStore((s) => s.markNotificationRead);

  return (
    <div className="safe-bottom px-5 pt-8">
      <h1 className="font-display text-[34px]">{t.notifications.title}</h1>
      {notifications.length === 0 ? (
        <p className="py-16 text-center text-muted">{t.notifications.empty}</p>
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((item) => (
            <Link
              key={item.id}
              href={item.actionHref ?? "/home"}
              onClick={() => markRead(item.id)}
              className="block rounded-[24px] bg-paper p-4"
            >
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.body}</p>
              {item.actionLabel && <p className="mt-3 text-sm text-rose">{item.actionLabel}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
