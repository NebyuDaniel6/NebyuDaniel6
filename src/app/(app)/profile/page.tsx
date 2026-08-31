"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const session = useAbebaStore((s) => s.session);
  const setLocale = useAbebaStore((s) => s.setLocale);
  const signOut = useAbebaStore((s) => s.signOut);
  const peopleCount = useAbebaStore((s) => s.people.length);
  const subCount = useAbebaStore((s) => s.subscriptions.length);

  const rows = [
    { href: "/people", label: t.profile.people, meta: String(peopleCount) },
    { href: "/addresses", label: t.profile.addresses },
    { href: "/settings/payments", label: t.profile.payments },
    { href: "/subscriptions", label: t.profile.subscriptions, meta: String(subCount) },
    { href: "/settings/notifications", label: t.profile.notifications },
    { href: "/orders", label: t.profile.history },
    { href: "/help", label: t.profile.help },
    { href: "/legal/terms", label: t.profile.terms },
    { href: "/legal/privacy", label: t.profile.privacy },
  ];

  return (
    <div className="safe-bottom px-5 pt-8">
      <h1 className="font-display text-[34px]">{t.profile.title}</h1>
      <div className="mt-4 rounded-[24px] bg-paper p-5">
        <p className="font-display text-2xl">{session?.fullName}</p>
        <p className="text-sm text-muted">{session?.email}</p>
        <p className="mt-2 text-sm">
          {t.profile.favorites}: {session?.favoriteFlowers.map((f) => t.flowers[f]).join(", ")}
        </p>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs uppercase tracking-[0.16em] text-muted">{t.profile.language}</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`rounded-2xl py-3 ${locale === "en" ? "bg-ink text-cream" : "bg-paper"}`}
          >
            {t.profile.english}
          </button>
          <button
            type="button"
            onClick={() => setLocale("am")}
            className={`rounded-2xl py-3 ${locale === "am" ? "bg-ink text-cream" : "bg-paper"}`}
          >
            {t.profile.amharic}
          </button>
        </div>
      </div>

      <div className="mt-6 divide-y divide-line overflow-hidden rounded-[24px] bg-paper">
        {rows.map((row) => (
          <Link key={row.href} href={row.href} className="flex items-center justify-between px-4 py-4">
            <span>{row.label}</span>
            <span className="text-sm text-muted">{row.meta ?? "›"}</span>
          </Link>
        ))}
      </div>

      <Button
        variant="ghost"
        className="mt-6 w-full"
        onClick={() => {
          signOut();
          router.push("/");
        }}
      >
        {t.profile.signOut}
      </Button>
    </div>
  );
}
