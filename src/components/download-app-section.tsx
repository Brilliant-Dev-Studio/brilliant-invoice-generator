"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Share, Smartphone } from "lucide-react";
import { AndroidLogo } from "@/components/android-logo";
import { PwaInstallButton } from "@/components/pwa-install-button";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { reloadOnceForPwaInstall } from "@/lib/pwa-install-flow";
import { AppVersionLanding } from "@/components/app-version";
import {
  type LandingLocale,
  translate,
} from "@/lib/landing-language";

export function DownloadAppSection({ locale }: { locale: LandingLocale }) {
  const t = (text: string) => translate(locale, text);
  const { platform, installed, canOneClickInstall } = usePwaInstall();
  const [androidHelp, setAndroidHelp] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    const onAndroid = () => {
      setAndroidHelp(true);
      setIosHelp(false);
    };
    const onIos = () => {
      setIosHelp(true);
      setAndroidHelp(false);
    };
    window.addEventListener("pwa-show-android-help", onAndroid);
    window.addEventListener("pwa-show-ios-help", onIos);
    return () => {
      window.removeEventListener("pwa-show-android-help", onAndroid);
      window.removeEventListener("pwa-show-ios-help", onIos);
    };
  }, []);

  useEffect(() => {
    if (canOneClickInstall) {
      setAndroidHelp(false);
    }
  }, [canOneClickInstall]);

  return (
    <section
      className="landing-section landing-download"
      id="download-app"
      aria-labelledby="download-app-title"
    >
      <div className="landing-section-heading">
        <span className="landing-kicker">
          <AndroidLogo size={15} /> {t("FREE · NO PLAY STORE")}
        </span>
        <h2 id="download-app-title">{t("Install San Pya in one tap")}</h2>
        <p>
          {t("Tap the button — Chrome installs the app to your home screen.")}
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
          <div className="landing-download-cta-wrap">
            <PwaInstallButton locale={locale} variant="section" />
            {!installed && canOneClickInstall ? (
              <p className="landing-download-ready" role="status">
                <Check size={16} aria-hidden="true" />
                {t("Ready — tap Install and confirm in Chrome")}
              </p>
            ) : null}
            {!installed && platform === "android" && !canOneClickInstall ? (
              <p className="landing-download-ready landing-download-ready-muted">
                {t("Use Chrome on Android for the one-tap install button.")}
              </p>
            ) : null}
          </div>
        </div>

        {androidHelp && !installed && !canOneClickInstall ? (
          <div
            className="landing-download-help landing-download-help-android"
            role="status"
          >
            <h3>
              <AndroidLogo size={20} /> {t("Almost there — Android")}
            </h3>
            <ol>
              <li>
                {t("Open this page in Chrome (not Facebook / TikTok browser)")}
              </li>
              <li>{t("Tap Refresh below, then the green Install button again")}</li>
              <li>
                {t("Or use Chrome menu (⋮) → Install app / Add to Home screen")}
              </li>
            </ol>
            <button
              type="button"
              className="button button-secondary landing-download-refresh"
              onClick={() => {
                if (!reloadOnceForPwaInstall()) {
                  window.location.assign(`${window.location.pathname}#download-app`);
                  window.location.reload();
                }
              }}
            >
              {t("Refresh page to enable install")}
            </button>
          </div>
        ) : null}

        {iosHelp && !installed ? (
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
            <span>{t("Same login, invoices, and PDF tools")}</span>
          </li>
          <li>
            <Check size={18} aria-hidden="true" />
            <span>{t("Works on Android and iPhone / iPad")}</span>
          </li>
          <li>
            <Check size={18} aria-hidden="true" />
            <span>{t("Internet required — always up to date")}</span>
          </li>
        </ul>

        <div className="landing-download-footer">
          <AppVersionLanding locale={locale} />
          <Link className="button button-secondary" href="/login">
            {t("Sign in to your workspace")}
            <ArrowUpRight size={16} />
          </Link>
          <details className="landing-download-more">
            <summary>
              <Smartphone size={16} aria-hidden="true" />
              {t("Manual install steps")}
            </summary>
            <div className="landing-download-more-body">
              <article>
                <h4>
                  <AndroidLogo size={16} /> {t("Android (Chrome)")}
                </h4>
                <p>
                  {t(
                    "Menu (⋮) → Install app or Add to Home screen, then open San Pya from your home screen.",
                  )}
                </p>
              </article>
              <article>
                <h4>{t("iPhone / iPad (Safari)")}</h4>
                <p>{t("Share → Add to Home Screen → Add.")}</p>
              </article>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
