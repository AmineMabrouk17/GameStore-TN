import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-7xl font-black text-emerald-400">404</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t("notFoundTitle")}</h1>
        <p className="text-neutral-400">{t("notFoundSubtitle")}</p>
      </div>
      <Link
        href="/"
        className="rounded-full border border-white/15 px-6 py-3 font-bold transition-colors hover:border-emerald-400"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
