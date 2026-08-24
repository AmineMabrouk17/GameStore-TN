import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const SITE_NAME = "GameStore TN";

const OG_LOCALES: Record<string, { locale: string; alternate: string }> = {
  ar: { locale: "ar_TN", alternate: "fr_FR" },
  fr: { locale: "fr_FR", alternate: "ar_TN" },
};

export function getMetadataBase(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamestore.tn";
  return new URL(raw);
}

function localePath(locale: string, path: string): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

export function localeAlternates(locale: string, path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const item of routing.locales) {
    languages[item] = localePath(item, path);
  }
  return { canonical: localePath(locale, path), languages };
}

export function openGraphLocale(locale: string) {
  return OG_LOCALES[locale] ?? OG_LOCALES.ar;
}
