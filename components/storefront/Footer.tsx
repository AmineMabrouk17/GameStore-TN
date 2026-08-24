import { useLocale, useTranslations } from "next-intl";
import { Gamepad2, Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/types";

interface FooterProps {
  categories?: { slug: string; name_ar: string; name_fr: string }[];
}

export default function Footer({ categories = [] }: FooterProps) {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const currentLocale = (useLocale() as Locale) ?? "ar";

  return (
    <footer className="mt-20 border-t border-white/10 bg-black/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-lg font-black">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/15 glow-cyan">
              <Gamepad2 className="size-5 text-primary" aria-hidden />
            </span>
            GameStore<span className="text-gradient"> TN</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
            {t("tagline")}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-neutral-300">
            {t("categories")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-400">
            {categories.slice(0, 6).map((category) => (
              <li key={category.slug}>
                <Link
                  href={{ pathname: "/catalog", query: { category: category.slug } }}
                  className="transition-colors hover:text-primary"
                >
                  {currentLocale === "ar" ? category.name_ar : category.name_fr}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-neutral-300">
            {t("links")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-400">
            <li>
              <Link href="/" className="transition-colors hover:text-primary">
                {tn("home")}
              </Link>
            </li>
            <li>
              <Link href="/catalog" className="transition-colors hover:text-primary">
                {tn("catalog")}
              </Link>
            </li>
            <li>
              <Link href="/admin/dashboard" className="transition-colors hover:text-primary">
                {tn("admin")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 px-4 py-6 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} GameStore TN — {t("rights")} · {t("madeIn")}
        <Heart className="ms-1 inline size-3 text-magenta" aria-hidden />
      </div>
    </footer>
  );
}
