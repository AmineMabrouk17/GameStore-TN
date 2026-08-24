import type { Currency, Locale } from "@/types";

const LOCALE_TAGS: Record<Locale, string> = {
  ar: "ar-TN-u-nu-latn",
  fr: "fr-FR",
};

const TND_LABELS: Record<Locale, string> = {
  ar: "د.ت",
  fr: "DT",
};

const numberFormatters = new Map<string, Intl.NumberFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function getNumberFormatter(locale: Locale, fractionDigits: number): Intl.NumberFormat {
  const key = `${locale}:${fractionDigits}`;
  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE_TAGS[locale], {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    numberFormatters.set(key, formatter);
  }
  return formatter;
}

function getDateFormatter(locale: Locale): Intl.DateTimeFormat {
  const tag = LOCALE_TAGS[locale];
  let formatter = dateFormatters.get(tag);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(tag, { dateStyle: "medium" });
    dateFormatters.set(tag, formatter);
  }
  return formatter;
}

export function formatPrice(amount: number, currency: Currency, locale: Locale): string {
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  const formattedAmount = getNumberFormatter(locale, fractionDigits).format(amount);
  if (currency === "EUR") {
    return `€${formattedAmount}`;
  }
  return `${formattedAmount} ${TND_LABELS[locale]}`;
}

export function formatDate(date: Date | string, locale: Locale): string {
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) {
    throw new RangeError("Invalid date");
  }
  return getDateFormatter(locale).format(value);
}
