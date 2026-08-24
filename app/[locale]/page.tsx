import { getTranslations, setRequestLocale } from "next-intl/server";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { Link } from "@/i18n/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("hero");
  const nav = await getTranslations("nav");
  const footer = await getTranslations("footer");

  const links = [
    { href: "/catalog", label: nav("catalog") },
    { href: "/how-it-works", label: nav("howItWorks") },
    { href: "/admin", label: nav("admin") },
  ];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col gap-12 px-6 py-10">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-black tracking-widest text-emerald-400"
        >
          GAMESTORE TN
        </Link>
        <LocaleSwitcher />
      </header>

      <main className="flex flex-col items-center gap-6 text-center">
        <p className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm font-bold text-emerald-300">
          {t("badge")}
        </p>
        <h1 className="text-5xl leading-tight font-extrabold sm:text-6xl">
          {t("titleLine1")}
          <br />
          <span className="text-emerald-400">{t("titleLine2")}</span>
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-neutral-400">
          {t("subtitle")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/catalog"
            className="rounded-full bg-emerald-500 px-7 py-3 font-bold text-neutral-950 transition-colors hover:bg-emerald-400"
          >
            {t("ctaBrowse")}
          </Link>
          <Link
            href="/sell"
            className="rounded-full border border-white/15 px-7 py-3 font-bold transition-colors hover:border-emerald-400"
          >
            {t("ctaSell")}
          </Link>
        </div>
        <nav aria-label={nav("home")} className="mt-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-400">
            <li>
              <Link href="/" className="transition-colors hover:text-white">
                {nav("home")}
              </Link>
            </li>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <footer className="mt-auto space-y-1 text-center text-xs text-neutral-500">
        <p>{footer("tagline")}</p>
        <p>© {new Date().getFullYear()} GameStore TN — {footer("rights")}. {footer("madeIn")}.</p>
      </footer>
    </div>
  );
}
