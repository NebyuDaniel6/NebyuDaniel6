"use client";

import { useRouter } from "next/navigation";
import { useAbebaStore } from "@/data/store";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/Button";

export default function WelcomePage() {
  const { t } = useI18n();
  const router = useRouter();
  const signIn = useAbebaStore((s) => s.signIn);

  function enter(role: "customer" | "admin" | "rider") {
    signIn(role);
    if (role === "admin") router.push("/admin");
    else if (role === "rider") router.push("/rider");
    else router.push("/home");
  }

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
          <Button className="w-full" onClick={() => enter("customer")}>
            {t.welcome.asCustomer}
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="soft" onClick={() => enter("admin")}>
              {t.welcome.asAdmin}
            </Button>
            <Button variant="ghost" className="border border-line" onClick={() => enter("rider")}>
              {t.welcome.asRider}
            </Button>
          </div>
          <p className="pt-2 text-center text-xs text-muted">{t.welcome.demoNote}</p>
        </div>
      </div>
    </div>
  );
}
