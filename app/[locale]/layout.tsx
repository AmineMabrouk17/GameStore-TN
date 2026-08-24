import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { hasLocale } from "use-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";

const ARABIC_FONT_STACK =
  '"SF Arabic", "Segoe UI", Tahoma, "Noto Kufi Arabic", "Noto Sans Arabic", sans-serif';
const LATIN_FONT_STACK =
  "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<LayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: {
      default: t("title"),
      template: "%s | GameStore TN",
    },
    description: t("description"),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={GeistSans.variable}
    >
      <body
        className="min-h-dvh bg-neutral-950 text-neutral-100 antialiased"
        style={{
          fontFamily: locale === "ar" ? ARABIC_FONT_STACK : LATIN_FONT_STACK,
        }}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
