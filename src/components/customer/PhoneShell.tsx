"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, Package, UserRound } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/home", key: "home", icon: Home },
  { href: "/shop", key: "shop", icon: ShoppingBag },
  { href: "/orders", key: "orders", icon: Package },
  { href: "/profile", key: "profile", icon: UserRound },
] as const;

export function PhoneShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  const hideNav =
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/shop/") ||
    pathname.includes("/send") ||
    pathname.startsWith("/people/new") ||
    pathname.startsWith("/legal");

  return (
    <div className="app-canvas">
      <div className="phone-shell relative mx-auto flex flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {!hideNav && (
          <nav className="absolute inset-x-0 bottom-0 border-t border-line/80 bg-paper/95 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
            <div className="grid grid-cols-4">
              {tabs.map((tab) => {
                const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.href}
                    type="button"
                    onClick={() => router.push(tab.href)}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2 text-[11px]",
                      active ? "text-rose" : "text-muted",
                    )}
                  >
                    <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
                    {t.tabs[tab.key]}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
