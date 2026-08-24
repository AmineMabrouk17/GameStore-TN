import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { MessageCircle, Sparkles, Store, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { FadeIn } from "@/components/animations/FadeIn";
import { buildGenericWhatsappUrl } from "@/lib/whatsapp";
import type { Locale } from "@/types";

interface HeroSectionProps {
  stats: { available: number; categories: number; sold: number };
}

export default async function HeroSection({ stats }: HeroSectionProps) {
  const t = await getTranslations("hero");
  const locale = ((await getLocale()) as Locale) ?? "ar";
  const whatsappHref = buildGenericWhatsappUrl(locale);

  return (
    <section className="relative overflow-hidden">
      <div className="grid-background absolute inset-0" aria-hidden />
      <div
        className="absolute -top-32 start-1/4 size-96 rounded-full bg-primary/20 blur-[120px] motion-safe:animate-[float_7s_ease-in-out_infinite]"
        aria-hidden
      />
      <div
        className="absolute top-24 end-1/4 size-80 rounded-full bg-magenta/15 blur-[120px] motion-safe:animate-[float_9s_ease-in-out_infinite_reverse]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <FadeIn>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-cyan-300">
            <Sparkles className="size-3.5" aria-hidden />
            {t("badge")}
          </span>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            <span className="text-gradient">{t("titleLine1")}</span>
            <br />
            {t("titleLine2")}
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg">
            {t("subtitle")}
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/catalog">
              <Button size="lg" className="glow-cyan">
                <Store className="size-5" aria-hidden />
                {t("ctaBrowse")}
              </Button>
            </Link>
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="secondary" className="glow-magenta">
                  <MessageCircle className="size-5" aria-hidden />
                  {t("ctaSell")}
                </Button>
              </a>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <dl className="mx-auto mt-14 grid max-w-xl grid-cols-3 gap-3">
            {[
              { icon: TrendingUp, label: t("statsAvailable"), value: stats.available },
              { icon: Store, label: t("statsCategories"), value: stats.categories },
              { icon: Sparkles, label: t("statsSold"), value: stats.sold },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl px-3 py-4">
                <stat.icon className="mx-auto size-5 text-primary" aria-hidden />
                <dt className="order-last mt-2 block text-xs text-neutral-400 sm:text-sm">
                  {stat.label}
                </dt>
                <dd className="text-2xl font-black text-white sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </FadeIn>
      </div>
    </section>
  );
}
