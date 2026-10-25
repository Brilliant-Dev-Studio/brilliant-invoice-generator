"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Smartphone, TabletSmartphone } from "lucide-react";
import {
  type LandingLocale,
  translate,
} from "@/lib/landing-language";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function DownloadAppSection({ locale }: { locale: LandingLocale }) {
  const t = (text: string) => translate(locale, text);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }
    const onInstallable = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onInstallable);
    return () =>
      window.removeEventListener("beforeinstallprompt", onInstallable);
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstalled(true);
  }

  return (
    <section
      className="landing-section landing-download"
      id="download-app"
      aria-labelledby="download-app-title"
    >
      <div className="landing-download-card">
        <div className="landing-download-copy">
          <span className="landing-kicker">
            <Smartphone size={15} /> {t("ON YOUR PHONE & TABLET")}
          </span>
          <h2 id="download-app-title">{t("Download the San Pya app")}</h2>
          <p className="landing-download-lede">
            {t(
              "Install San Pya on your home screen — no Play Store required. Same login, invoices, and PDF tools you already use in the browser.",
            )}
          </p>
          <ul className="landing-download-points">
            <li>
              <Check size={16} aria-hidden="true" />
              {t("Free install from your browser")}
            </li>
            <li>
              <Check size={16} aria-hidden="true" />
              {t("Works on Android and iPhone / iPad")}
            </li>
            <li>
              <Check size={16} aria-hidden="true" />
              {t("Internet required — always up to date")}
            </li>
          </ul>
          <div className="landing-download-actions">
            {installPrompt && !installed ? (
              <button
                type="button"
                className="button button-primary"
                onClick={installApp}
              >
                {t("Install app")}
                <ArrowUpRight size={17} />
              </button>
            ) : installed ? (
              <span className="landing-download-installed" role="status">
                <Check size={16} /> {t("App installed — open from your home screen")}
              </span>
            ) : (
              <span className="landing-download-hint">
                {t("Use the steps on the right, or open this page in Chrome on Android.")}
              </span>
            )}
            <Link className="button button-secondary" href="/login">
              {t("Sign in to your workspace")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <div className="landing-download-steps">
          <div className="landing-download-icon" aria-hidden="true">
            <Image
              src="/icons/icon-192.png"
              alt=""
              width={96}
              height={96}
              priority={false}
            />
          </div>
          <article className="landing-download-platform">
            <h3>
              <Smartphone size={18} aria-hidden="true" />
              {t("Android (Chrome)")}
            </h3>
            <ol>
              <li>{t("Open brilliant-invoice-generator.vercel.app in Chrome")}</li>
              <li>{t("Tap the menu (⋮) → Install app or Add to Home screen")}</li>
              <li>{t("Open San Pya from your home screen")}</li>
            </ol>
          </article>
          <article className="landing-download-platform">
            <h3>
              <TabletSmartphone size={18} aria-hidden="true" />
              {t("iPhone / iPad (Safari)")}
            </h3>
            <ol>
              <li>{t("Open the site in Safari")}</li>
              <li>{t("Tap Share → Add to Home Screen")}</li>
              <li>{t("Tap Add — look for the San Pya icon")}</li>
            </ol>
          </article>
        </div>
      </div>
    </section>
  );
}
