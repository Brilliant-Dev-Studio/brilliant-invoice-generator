import { cookies } from "next/headers";
import { LANGUAGE_COOKIE, landingLocale } from "./landing-language";
import { platformTranslate } from "./platform-language";

export async function getTranslations() {
  const locale = landingLocale((await cookies()).get(LANGUAGE_COOKIE)?.value);
  return (text: string, values?: Record<string, string | number>) =>
    platformTranslate(locale, text, values);
}
