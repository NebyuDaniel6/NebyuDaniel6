"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", key: "demand" },
  { href: "/admin/orders", key: "orders" },
  { href: "/admin/bouquets", key: "bouquets" },
  { href: "/admin/inventory", key: "inventory" },
  { href: "/admin/customers", key: "customers" },
  { href: "/admin/recipients", key: "recipients" },
  { href: "/admin/delivery", key: "delivery" },
  { href: "/admin/subscriptions", key: "subscriptions" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className="min-h-dvh bg-ivory text-ink">
      <div className="mx-auto flex max-w-6xl flex-col md:flex-row">
        <aside className="border-b border-line px-5 py-6 md:min-h-dvh md:w-60 md:border-b-0 md:border-r">
          <Link href="/" className="font-display text-3xl text-rose">
            አበባ
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold">{t.admin.title}</p>
          <nav className="mt-6 flex gap-2 overflow-x-auto md:flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 rounded-full px-3 py-2 text-sm",
                  pathname === link.href ? "bg-ink text-cream" : "text-muted hover:bg-paper",
                )}
              >
                {t.admin[link.key]}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 px-5 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
