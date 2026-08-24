"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import FacebookIcon from "@/components/FacebookIcon";
import { Link, usePathname } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { Button } from "@/components/ui";
import { buildGenericWhatsappUrl } from "@/lib/whatsapp";
import { FACEBOOK_PAGE_URL } from "@/lib/facebook";
import type { Locale } from "@/types";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/catalog", key: "catalog" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);

  const whatsappHref = buildGenericWhatsappUrl(locale);

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-black tracking-tight"
          onClick={() => setOpen(false)}
        >
          <img
            src="/logo.png"
            alt=""
            aria-hidden
            className="size-9 rounded-xl object-cover glow-cyan ring-1 ring-white/15"
          />
          <span>
            GameStore<span className="text-gradient"> TN</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t("menu")}>
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  active
                    ? "bg-white/10 text-white"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white",
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block"
          >
            <Button size="sm" variant="secondary" aria-label={tc("facebook")}>
              <FacebookIcon className="size-4" aria-hidden />
              <span className="hidden lg:inline">{tc("facebook")}</span>
            </Button>
          </a>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block"
            >
              <Button size="sm" variant="secondary" className="glow-cyan">
                {tc("whatsapp")}
              </Button>
            </a>
          )}
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg text-neutral-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 md:hidden"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-4 py-3 md:hidden" aria-label={t("menu")}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-bold text-neutral-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              onClick={() => setOpen(false)}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
