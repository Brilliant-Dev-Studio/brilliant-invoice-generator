"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { LANGUAGE_COOKIE, type LandingLocale } from "@/lib/landing-language";
import { useLanguage } from "./language-provider";

export function LanguageSwitcher({ locale }: { locale?: LandingLocale } = {}) {
  const currentLocale = useLanguage();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <label className="language-switcher" aria-busy={pending}>
      <Languages size={17} aria-hidden="true" />
      <span className="sr-only">Language / ဘာသာစကား</span>
      <select
        value={locale ?? currentLocale}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value === "my" ? "my" : "en";
          document.cookie = `${LANGUAGE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
          startTransition(() => router.refresh());
        }}
      >
        <option value="en" lang="en">
          English
        </option>
        <option value="my" lang="my">
          မြန်မာ
        </option>
      </select>
    </label>
  );
}
