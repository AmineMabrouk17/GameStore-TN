import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-8 overflow-hidden px-6 py-20 text-center">
      <div className="grid-background absolute inset-0" aria-hidden />
      <div
        className="absolute -top-24 start-1/4 size-80 rounded-full bg-primary/20 blur-[120px]"
        aria-hidden
      />
      <div
        className="absolute bottom-1/4 end-1/4 size-80 rounded-full bg-accent/15 blur-[120px]"
        aria-hidden
      />

      <p
        className="text-gradient relative text-[6rem] font-black leading-none tracking-tight glow-cyan motion-safe:animate-pulse-glow sm:text-[9rem]"
        aria-hidden
      >
        404
      </p>

      <div className="relative space-y-2">
        <h1 className="text-2xl font-black sm:text-3xl">{t("notFoundTitle")}</h1>
        <p className="mx-auto max-w-md text-neutral-400">{t("notFoundSubtitle")}</p>
      </div>

      <Link href="/" className="relative">
        <Button size="lg" variant="outline" className="glow-cyan">
          {t("backHome")}
        </Button>
      </Link>
    </main>
  );
}
