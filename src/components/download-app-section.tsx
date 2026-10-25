"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Share } from "lucide-react";
import { AndroidApkDownloadButton } from "@/components/android-apk-download-button";
import { AndroidLogo } from "@/components/android-logo";
import { LandingPhoneMockup } from "@/components/landing-phone-mockup";
import { PwaInstallButton } from "@/components/pwa-install-button";
import { AppVersionLanding } from "@/components/app-version";
import { detectPwaPlatform } from "@/lib/pwa-client";
import {
  type LandingLocale,
  translate,
} from "@/lib/landing-language";

const STEPS = [
  "Tap Download APK",
  "Install the file",
  "Open the app and sign in",
] as const;

export function DownloadAppSection({ locale }: { locale: LandingLocale }) {
  const t = (text: string) => translate(locale, text);
  const [platform, setPlatform] = useState<"android" | "ios" | "other">(
    "other",
  );

  useEffect(() => {
    const p = detectPwaPlatform();
    setPlatform(p === "android" ? "android" : p === "ios" ? "ios" : "other");
  }, []);

  return (
    <section
      className="landing-section landing-download"
      id="download-app"
      aria-labelledby="download-app-title"
    >
      <div className="landing-download-split">
        <LandingPhoneMockup locale={locale} />

        <div className="landing-download-panel">
          <header className="landing-download-panel-head">
            <span className="landing-kicker">
              <AndroidLogo size={14} /> {t("ANDROID APP")}
            </span>
            <h2 id="download-app-title">{t("Get San Pya on your phone")}</h2>
            <p>
              {t(
                "Download the APK — the app opens the same San Pya workspace you use in the browser.",
              )}
            </p>
          </header>

          <div className="landing-download-actions-block">
            <AndroidApkDownloadButton
              locale={locale}
              variant="section"
              className="landing-download-primary"
            />
            <ol className="landing-download-steps">
              {STEPS.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  {t(step)}
                </li>
              ))}
            </ol>
          </div>

          {platform === "ios" ? (
            <div className="landing-download-note landing-download-note-ios">
              <Share size={16} aria-hidden="true" />
              <p>
                {t("iPhone / iPad:")}{" "}
                {t("Safari → Share → Add to Home Screen")}
              </p>
            </div>
          ) : (
            <details className="landing-download-pwa">
              <summary>{t("Or install from Chrome without APK")}</summary>
              <div className="landing-download-pwa-body">
                <p>
                  {t(
                    "On Android Chrome you can add San Pya to your home screen without downloading a file.",
                  )}
                </p>
                <PwaInstallButton locale={locale} variant="section" />
              </div>
            </details>
          )}

          <ul className="landing-download-tags" aria-label={t("App highlights")}>
            <li>
              <Check size={14} aria-hidden="true" />
              {t("Home screen app")}
            </li>
            <li>
              <Check size={14} aria-hidden="true" />
              {t("Same login & invoices")}
            </li>
            <li>
              <Check size={14} aria-hidden="true" />
              {t("Updates over the web")}
            </li>
          </ul>

          <div className="landing-download-footer">
            <AppVersionLanding locale={locale} />
            <Link className="landing-download-signin" href="/login">
              {t("Sign in")}
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
