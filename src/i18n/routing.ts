import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "it"],
  defaultLocale: "fr",
  localePrefix: "always",
});
