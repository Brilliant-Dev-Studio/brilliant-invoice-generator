import { APP_DISPLAY_VERSION, APP_VERSION } from "@/lib/app-version";
import { T } from "@/components/language-provider";
import {
  type LandingLocale,
  translate,
} from "@/lib/landing-language";

export function AppVersionText({ className }: { className?: string }) {
  return (
    <span
      className={className ?? "app-version-text"}
      title={`San Pya Invoice ${APP_VERSION}`}
    >
      <T text="App version" />{" "}
      <strong className="app-version-number">{APP_DISPLAY_VERSION}</strong>
    </span>
  );
}

export function AppVersionLanding({ locale }: { locale: LandingLocale }) {
  const t = (text: string) => translate(locale, text);
  return (
    <p className="landing-app-version" title={`San Pya Invoice ${APP_VERSION}`}>
      {t("App version")}{" "}
      <span className="landing-app-version-number">{APP_DISPLAY_VERSION}</span>
    </p>
  );
}

export function AppAboutPanel() {
  return (
    <section className="panel app-about-panel" aria-labelledby="app-about-title">
      <h2 id="app-about-title" className="app-about-title">
        <T text="About this app" />
      </h2>
      <AppVersionText />
      <p className="panel-description app-about-note">
        <T text="When we release updates, refresh or reopen the app while you are online to get the latest version." />
      </p>
    </section>
  );
}
