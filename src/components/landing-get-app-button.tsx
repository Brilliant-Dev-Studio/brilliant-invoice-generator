"use client";

import { useEffect, useState } from "react";
import { AndroidApkDownloadButton } from "@/components/android-apk-download-button";
import { PwaInstallButton } from "@/components/pwa-install-button";
import { detectPwaPlatform } from "@/lib/pwa-client";
import type { LandingLocale } from "@/lib/landing-language";

type Variant = "header" | "hero" | "section";

/** Android: APK download. iOS/desktop: PWA / add-to-home flow. */
export function LandingGetAppButton({
  locale,
  variant,
}: {
  locale: LandingLocale;
  variant: Variant;
}) {
  const [platform, setPlatform] = useState<"android" | "other">("other");

  useEffect(() => {
    setPlatform(detectPwaPlatform() === "android" ? "android" : "other");
  }, []);

  if (platform === "android") {
    return <AndroidApkDownloadButton locale={locale} variant={variant} />;
  }

  return <PwaInstallButton locale={locale} variant={variant} />;
}
