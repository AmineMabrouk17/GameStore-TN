"use client";

import { Suspense, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<(typeof routing.locales)[number], string> = {
  ar: "العربية",
  fr: "Français",
};

function Switcher() {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = useLocale();
  const [pending, startTransition] = useTransition();

  function switchTo(next: (typeof routing.locales)[number]) {
    if (next === active || pending) return;
    startTransition(() => {
      const query = Object.fromEntries(searchParams.entries());
      const hasQuery = searchParams.size > 0;
      router.replace(hasQuery ? { pathname, query } : pathname, {
        locale: next,
      });
    });
  }

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-xs font-bold"
    >
      {routing.locales.map((loc) => {
        const isActive = loc === active;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchTo(loc)}
            disabled={pending}
            aria-pressed={isActive}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              isActive
                ? "bg-emerald-500 text-neutral-950"
                : "text-neutral-300 hover:text-white"
            } ${pending ? "opacity-60" : ""}`}
          >
            {LOCALE_LABELS[loc]}
          </button>
        );
      })}
    </div>
  );
}

export default function LocaleSwitcher() {
  return (
    <Suspense
      fallback={
        <div className="h-8 w-28 animate-pulse rounded-full border border-white/10 bg-white/5" />
      }
    >
      <Switcher />
    </Suspense>
  );
}
