"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Share, Smartphone } from "lucide-react";
import { AndroidApkDownloadButton } from "@/components/android-apk-download-button";
import { AndroidLogo } from "@/components/android-logo";
import { PwaInstallButton } from "@/components/pwa-install-button";
import { AppVersionLanding } from "@/components/app-version";
import { detectPwaPlatform } from "@/lib/pwa-client";
import {
  type LandingLocale,
  translate,
} from "@/lib/landing-language";

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
      <div className="landing-section-heading">
        <span className="landing-kicker">
          <AndroidLogo size={15} /> {t("ANDROID APP · WEB INSIDE")}
        </span>
        <h2 id="download-app-title">{t("Download the San Pya Android app")}</h2>
        <p>
          {t(
            "Install the APK like any app. Inside, you use the same San Pya website — login, invoices, and PDF.",
          )}
        </p>
      </div>

      <div className="landing-download-card">
        <div className="landing-download-spotlight">
          <div className="landing-download-icon-wrap" aria-hidden="true">
            <Image
              src="/icons/icon-192.png"
              alt=""
              width={104}
              height={104}
              className="landing-download-app-icon"
            />
          </div>
          <div className="landing-download-cta-wrap landing-download-cta-apk">
            <AndroidApkDownloadButton locale={locale} variant="section" />
            <p className="landing-download-ready landing-download-ready-muted">
              {t("After download: open the file → Install → open San Pya from your home screen.")}
            </p>
          </div>
        </div>

        <div className="landing-download-apk-steps">
          <h3>{t("Install the APK")}</h3>
          <ol>
            <li>{t("Tap Download APK above")}</li>
            <li>{t("If asked, allow install from this browser or Files app")}</li>
            <li>{t("Open San Pya — sign in with your workspace account")}</li>
          </ol>
        </div>

        <div className="landing-download-alt">
          <h3>
            <Smartphone size={18} aria-hidden="true" />
            {t("No APK? Quick browser install")}
          </h3>
          <p>{t("On Android Chrome you can also add San Pya to your home screen without downloading a file.")}</p>
          <div className="landing-download-cta-wrap landing-download-cta-pwa">
            <PwaInstallButton locale={locale} variant="section" />
          </div>
        </div>

        {platform === "ios" ? (
          <div className="landing-download-help landing-download-help-ios" role="status">
            <h3>
              <Share size={20} aria-hidden="true" /> {t("iPhone / iPad")}
            </h3>
            <ol>
              <li>{t("Open the site in Safari")}</li>
              <li>{t("Tap Share → Add to Home Screen")}</li>
              <li>{t("Tap Add — look for the San Pya icon")}</li>
            </ol>
          </div>
        ) : null}

        <ul className="landing-download-benefits">
          <li>
            <Check size={18} aria-hidden="true" />
            <span>{t("Real app icon on your home screen")}</span>
          </li>
          <li>
            <Check size={18} aria-hidden="true" />
            <span>{t("Same login, invoices, and PDF tools")}</span>
          </li>
          <li>
            <Check size={18} aria-hidden="true" />
            <span>{t("Web updates — no reinstall for most features")}</span>
          </li>
        </ul>

        <div className="landing-download-footer">
          <AppVersionLanding locale={locale} />
          <Link className="button button-secondary" href="/login">
            {t("Sign in to your workspace")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
