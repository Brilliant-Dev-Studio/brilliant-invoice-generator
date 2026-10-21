"use client";

import { createContext, useContext } from "react";
import type { LandingLocale } from "@/lib/landing-language";
import { platformTranslate } from "@/lib/platform-language";

const LanguageContext = createContext<LandingLocale>("en");

export function LanguageProvider({
  locale,
  children,
}: {
  locale: LandingLocale;
  children: React.ReactNode;
}) {
  return (
    <LanguageContext.Provider value={locale}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTranslations() {
  const locale = useLanguage();
  return (text: string, values?: Record<string, string | number>) =>
    platformTranslate(locale, text, values);
}

export function T({
  text,
  values,
}: {
  text: string;
  values?: Record<string, string | number>;
}) {
  const t = useTranslations();
  return t(text, values);
}
