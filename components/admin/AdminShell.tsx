"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink, Gamepad2, LayoutDashboard, LogOut } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { Button } from "@/components/ui";
import { api } from "@/lib/client-api";
import { toast } from "sonner";

interface AdminShellProps {
  username: string;
  children: ReactNode;
}

export default function AdminShell({ username, children }: AdminShellProps) {
  const t = useTranslations("nav");
  const ta = useTranslations("admin");
  const auth = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    try {
      await api.post("/api/auth/logout", {});
      toast.success(auth("loggedOut"));
      router.replace("/admin/login");
      router.refresh();
    } catch {
      toast.error(tc("error"));
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="glass sticky top-0 z-50 border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-black">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/15 glow-cyan">
                <Gamepad2 className="size-5 text-primary" aria-hidden />
              </span>
              <span className="hidden sm:inline">
                {ta("dashboard")}
              </span>
            </Link>
            <Link
              href="/admin/dashboard"
              aria-current={pathname === "/admin/dashboard" ? "page" : undefined}
              className="hidden items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white min-[420px]:flex"
            >
              <LayoutDashboard className="size-4 shrink-0" aria-hidden />
              {ta("products")}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-bold text-neutral-400 md:inline">@{username}</span>
            <LocaleSwitcher />
            <Link href="/" target="_blank">
              <Button variant="secondary" size="sm">
                <ExternalLink className="size-4" aria-hidden />
                <span className="hidden md:inline">{t("viewStore")}</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" aria-hidden />
              <span className="hidden md:inline">{auth("logout")}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
