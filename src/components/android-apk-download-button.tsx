"use client";

import { Download } from "lucide-react";
import { AndroidLogo } from "@/components/android-logo";
import { getAndroidApkDownloadUrl } from "@/lib/android-apk";
import {
  type LandingLocale,
  translate,
} from "@/lib/landing-language";

type Variant = "header" | "hero" | "section";

export function AndroidApkDownloadButton({
  locale,
  variant,
  className = "",
}: {
  locale: LandingLocale;
  variant: Variant;
  className?: string;
}) {
  const t = (text: string) => translate(locale, text);
  const href = getAndroidApkDownloadUrl();

  const classes = [
    variant === "section" ? "pwa-install-cta" : "button",
    variant === "section"
      ? ""
      : variant === "header"
        ? "button-primary"
        : "button-secondary",
    variant === "header" ? "landing-header-download" : "",
    variant === "section" ? "pwa-install-cta-android" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconSize = variant === "section" ? 26 : 18;
  const label =
    variant === "section" ? t("Download APK — Android app") : t("Download APK");

  return (
    <a
      href={href}
      className={classes}
      download
      rel="noopener"
    >
      <AndroidLogo size={iconSize} />
      {variant !== "section" ? (
        <Download size={16} aria-hidden="true" />
      ) : null}
      <span>{label}</span>
    </a>
  );
}
