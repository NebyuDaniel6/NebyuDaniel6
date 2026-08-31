"use client";

import Link from "next/link";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";

export default function WelcomePage() {
  const { t } = useI18n();
  const signIn = useAbebaStore((s) => s.signIn);

  return (
    <div className="app-canvas">
      <div className="phone-shell mx-auto flex flex-col justify-between px-8 py-14">
        <div className="pt-16 text-center">
          <p className="text-xs tracking-[0.35em] text-gold uppercase">Abeba</p>
          <h1 className="mt-4 font-display text-7xl leading-none text-rose">አበባ</h1>
          <p className="mx-auto mt-6 max-w-[16rem] font-display text-2xl leading-snug text-ink">
            {t.tagline}
          </p>
        </div>
        <div className="space-y-3">
          <Link
            href="/home"
            onClick={() => signIn("customer")}
            className="flex w-full items-center justify-center rounded-full bg-rose px-5 py-3.5 text-[15px] font-medium text-white shadow-[0_10px_24px_rgba(139,61,74,0.28)]"
          >
            {t.welcome.asCustomer}
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin"
              onClick={() => signIn("admin")}
              className="flex items-center justify-center rounded-full bg-blush px-5 py-3.5 text-[15px] font-medium text-rose-deep"
            >
              {t.welcome.asAdmin}
            </Link>
            <Link
              href="/rider"
              onClick={() => signIn("rider")}
              className="flex items-center justify-center rounded-full border border-line px-5 py-3.5 text-[15px] font-medium"
            >
              {t.welcome.asRider}
            </Link>
          </div>
          <p className="pt-2 text-center text-xs text-muted">{t.welcome.demoNote}</p>
        </div>
      </div>
    </div>
  );
}
