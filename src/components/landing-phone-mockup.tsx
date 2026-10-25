import { Files, LayoutGrid, Plus, Users } from "lucide-react";
import { Brand } from "@/components/brand";
import {
  type LandingLocale,
  translate,
} from "@/lib/landing-language";

export function LandingPhoneMockup({ locale }: { locale: LandingLocale }) {
  const t = (text: string) => translate(locale, text);

  return (
    <div className="landing-phone-stage">
      <div className="landing-phone-glow" aria-hidden="true" />
      <div className="landing-phone-device">
        <div className="landing-phone-frame">
          <div className="landing-phone-notch" aria-hidden="true" />
          <div className="landing-phone-screen">
            <div className="landing-phone-ui">
              <header className="landing-phone-topbar">
                <Brand />
                <span className="landing-phone-avatar">S</span>
              </header>
              <div className="landing-phone-hero">
                <span className="landing-phone-eyebrow">
                  {t("YOUR BUSINESS WORKSPACE")}
                </span>
                <p className="landing-phone-title">
                  <span lang="my" className="san-pya-name">စံပြ</span>
                  <br />
                  <strong>{t("Welcome back")}</strong>
                </p>
              </div>
              <div className="landing-phone-stats">
                <div>
                  <small>{t("Monthly revenue")}</small>
                  <strong>2.4M</strong>
                  <span>MMK</span>
                </div>
                <div>
                  <small>{t("Recent invoices")}</small>
                  <strong>12</strong>
                </div>
              </div>
              <ul className="landing-phone-invoices">
                <li>
                  <span>#INV-104</span>
                  <strong>450,000</strong>
                  <em>{t("Paid")}</em>
                </li>
                <li>
                  <span>#INV-105</span>
                  <strong>180,000</strong>
                  <em>{t("Draft")}</em>
                </li>
              </ul>
              <nav className="landing-phone-dock" aria-hidden="true">
                <span className="active">
                  <LayoutGrid size={14} />
                </span>
                <span>
                  <Files size={14} />
                </span>
                <span>
                  <Users size={14} />
                </span>
                <span className="landing-phone-dock-fab">
                  <Plus size={16} />
                </span>
              </nav>
            </div>
          </div>
        </div>
      </div>
      <p className="landing-phone-caption">{t("San Pya on your phone")}</p>
    </div>
  );
}
