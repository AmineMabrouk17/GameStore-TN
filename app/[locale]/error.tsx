"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";

interface LocaleErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  const t = useTranslations("errors");
  const tc = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-6 overflow-hidden px-6 py-20 text-center">
      <div className="grid-background absolute inset-0" aria-hidden />
      <div
        className="absolute -top-24 start-1/4 size-80 rounded-full bg-danger/15 blur-[120px]"
        aria-hidden
      />
      <div
        className="absolute bottom-1/4 end-1/4 size-72 rounded-full bg-primary/15 blur-[120px]"
        aria-hidden
      />

      <span className="glass relative grid size-16 place-items-center rounded-2xl glow-magenta motion-safe:animate-pulse-glow">
        <TriangleAlert className="size-8 text-accent" aria-hidden />
      </span>

      <h1 className="relative text-3xl font-black sm:text-4xl">
        <span className="text-gradient">{t("errorTitle")}</span>
      </h1>
      <p className="relative max-w-md text-neutral-300">{t("genericError")}</p>

      <div className="relative flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" className="glow-cyan" onClick={reset}>
          <RotateCcw className="size-5" aria-hidden />
          {tc("retry")}
        </Button>
        <Link href="/">
          <Button size="lg" variant="secondary">
            {t("backHome")}
          </Button>
        </Link>
      </div>
    </main>
  );
}
