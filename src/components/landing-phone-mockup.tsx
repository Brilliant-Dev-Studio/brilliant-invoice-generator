import {
  CalendarDays,
  Clock3,
  Files,
  LayoutGrid,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { Brand } from "@/components/brand";
import {
  type LandingLocale,
  translate,
} from "@/lib/landing-language";

export function LandingPhoneMockup({ locale }: { locale: LandingLocale }) {
  const t = (text: string) => translate(locale, text);
  const navHome = locale === "my" ? "ပင်မ" : "Home";
  const navInvoices = locale === "my" ? "ပြေစာ" : "Invoices";
  const navClients = locale === "my" ? "ဖောက်သည်" : "Clients";

  return (
    <div className="landing-phone-stage">
      <div className="landing-phone-glow" aria-hidden="true" />
      <div className="landing-phone-device">
        <div className="landing-phone-contact-shadow" aria-hidden="true" />
        <div className="landing-phone-rig">
          <div className="landing-phone-layer landing-phone-layer-back" aria-hidden="true" />
          <div
            className="landing-phone-layer landing-phone-layer-edge landing-phone-layer-edge-left"
            aria-hidden="true"
          />
          <div
            className="landing-phone-layer landing-phone-layer-edge landing-phone-layer-edge-right"
            aria-hidden="true"
          />
          <div className="landing-phone-frame">
            <div className="landing-phone-side-btn landing-phone-side-vol" aria-hidden="true" />
            <div className="landing-phone-side-btn landing-phone-side-power" aria-hidden="true" />
            <div className="landing-phone-screen">
            <div className="landing-phone-status" aria-hidden="true">
              <span className="landing-phone-status-time">9:41</span>
              <span className="landing-phone-camera-hole" />
              <span className="landing-phone-status-icons">
                <span className="landing-phone-signal" />
                <span className="landing-phone-battery" />
              </span>
            </div>
            <div className="landing-phone-ui">
              <header className="landing-phone-topbar">
                <Brand />
                <span className="landing-phone-avatar">S</span>
              </header>
              <div className="landing-phone-workspace" aria-hidden="true">
                <span className="landing-phone-workspace-dot" />
                <span className="landing-phone-workspace-name">
                  {locale === "my" ? "စံပြ စတူဒီယို" : "San Pya Studio"}
                </span>
              </div>
              <div className="landing-phone-hero">
                <span className="landing-phone-eyebrow">
                  <CalendarDays size={9} strokeWidth={2.2} aria-hidden="true" />
                  {t("YOUR BUSINESS, IN FOCUS")}
                </span>
                <p className="landing-phone-title">
                  {t("Welcome back,")}{" "}
                  <strong>{locale === "my" ? "အောင်မင်း" : "Aung"}</strong>
                  <span className="landing-phone-title-dot">.</span>
                </p>
                <span className="landing-phone-cta">
                  <Plus size={11} strokeWidth={2.5} aria-hidden="true" />
                  {t("Create invoice")}
                </span>
              </div>
              <div className="landing-phone-section-head">
                <span>{t("Financial overview")}</span>
                <div className="landing-phone-currency">
                  <span className="active">MMK</span>
                  <span>USD</span>
                  <span>THB</span>
                </div>
              </div>
              <div className="landing-phone-stats">
                <article className="landing-phone-stat featured">
                  <div>
                    <small>{t("Monthly revenue")}</small>
                    <TrendingUp size={11} strokeWidth={2.2} aria-hidden="true" />
                  </div>
                  <strong>၁,၂၀၀,၀၀၀</strong>
                  <p>
                    <span className="landing-phone-live-dot" />
                    {t("Paid in")} 2026-10
                  </p>
                </article>
                <article className="landing-phone-stat">
                  <div>
                    <small>{t("Outstanding balance")}</small>
                    <Clock3 size={11} strokeWidth={2.2} aria-hidden="true" />
                  </div>
                  <strong>၄၅၀,၀၀၀</strong>
                </article>
                <article className="landing-phone-stat">
                  <div>
                    <small>{t("Recent invoices")}</small>
                    <Files size={11} strokeWidth={2.2} aria-hidden="true" />
                  </div>
                  <strong>12</strong>
                </article>
              </div>
              <p className="landing-phone-list-label">{t("Recent invoices")}</p>
              <ul className="landing-phone-invoices">
                <li>
                  <div>
                    <span>#INV-104</span>
                    <em>{t("Paid")}</em>
                  </div>
                  <strong>၄၅၀,၀၀၀</strong>
                </li>
                <li>
                  <div>
                    <span>#INV-105</span>
                    <em className="draft">{t("Draft")}</em>
                  </div>
                  <strong>၁၈၀,၀၀၀</strong>
                </li>
              </ul>
              <nav className="landing-phone-dock" aria-hidden="true">
                <span className="active">
                  <LayoutGrid size={15} strokeWidth={2.2} />
                  <em>{navHome}</em>
                </span>
                <span>
                  <Files size={15} strokeWidth={2.2} />
                  <em>{navInvoices}</em>
                </span>
                <span>
                  <Users size={15} strokeWidth={2.2} />
                  <em>{navClients}</em>
                </span>
              </nav>
            </div>
            <div className="landing-phone-shine" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      <p className="landing-phone-caption">{t("San Pya on your phone")}</p>
    </div>
  );
}
