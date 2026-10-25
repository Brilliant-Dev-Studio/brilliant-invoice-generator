"use client";

import { useState } from "react";
import { Check, Download } from "lucide-react";
import { AndroidLogo } from "@/components/android-logo";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import {
  scrollToDownloadSection,
  type PwaPlatform,
} from "@/lib/pwa-client";
import {
  type LandingLocale,
  translate,
} from "@/lib/landing-language";

type Variant = "header" | "hero" | "section";

export function PwaInstallButton({
  locale,
  variant,
  className = "",
}: {
  locale: LandingLocale;
  variant: Variant;
  className?: string;
}) {
  const t = (text: string) => translate(locale, text);
  const { platform, installed, canOneClickInstall, install, prepareAndroidInstall } =
    usePwaInstall();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (installed) {
      window.location.href = "/login";
      return;
    }

    setBusy(true);
    try {
      if (canOneClickInstall) {
        await install();
        return;
      }

      if (platform === "android") {
        const next = prepareAndroidInstall();
        if (next === "chrome") return;
        scrollToDownloadSection(true);
        window.dispatchEvent(new CustomEvent("pwa-show-android-help"));
        return;
      }

      if (platform === "ios") {
        scrollToDownloadSection(true);
        window.dispatchEvent(new CustomEvent("pwa-show-ios-help"));
        return;
      }

      const outcome = await install();
      if (outcome === "unavailable") {
        scrollToDownloadSection(true);
      }
    } finally {
      setBusy(false);
    }
  }

  const label = labelForVariant(variant, platform, installed, canOneClickInstall, t);
  const iconSize = variant === "section" ? 22 : 16;
  const androidIconSize = variant === "section" ? 26 : 18;
  const showAndroidIcon =
    !installed && (platform === "android" || variant === "section");

  const classes = [
    variant === "section" ? "pwa-install-cta" : "button",
    variant === "section" ? "" : variant === "header" ? "button-primary" : "button-secondary",
    variant === "header" ? "landing-header-download" : "",
    variant === "section" ? "pwa-install-cta-android" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      id={variant === "section" ? "pwa-install-primary" : undefined}
      className={classes}
      onClick={handleClick}
      disabled={busy}
      aria-busy={busy}
    >
      {installed ? (
        <Check size={iconSize} aria-hidden="true" />
      ) : showAndroidIcon ? (
        <AndroidLogo size={androidIconSize} />
      ) : (
        <Download size={iconSize} aria-hidden="true" />
      )}
      <span>{label}</span>
    </button>
  );
}

function labelForVariant(
  variant: Variant,
  platform: PwaPlatform,
  installed: boolean,
  canOneClickInstall: boolean,
  t: (text: string) => string,
): string {
  if (installed) {
    return variant === "section"
      ? t("Installed — open San Pya")
      : t("Open app");
  }
  if (canOneClickInstall) {
    return variant === "section"
      ? t("Install now — one tap")
      : t("Install now");
  }
  if (platform === "android") {
    return variant === "section"
      ? t("Install on Android")
      : t("Download app");
  }
  if (platform === "ios") {
    return t("Add to Home Screen");
  }
  return t("Download app");
}
