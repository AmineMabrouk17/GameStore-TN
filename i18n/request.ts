import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "use-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const activeLocale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale: activeLocale,
    messages: (await import(`../messages/${activeLocale}.json`)).default,
  };
});
