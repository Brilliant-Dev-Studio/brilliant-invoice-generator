import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  LANGUAGE_COOKIE,
  landingLocale,
  translate,
} from "@/lib/landing-language";
import { LanguageSwitcher } from "@/components/language-switcher";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  CheckCheck,
  Cloud,
  Heart,
  Headphones,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-provider";
import { DownloadAppSection } from "@/components/download-app-section";
import { LandingGetAppButton } from "@/components/landing-get-app-button";
import { PricingPlans } from "@/components/pricing-plans";
import "./landing.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = landingLocale((await cookies()).get(LANGUAGE_COOKIE)?.value);
  return locale === "my"
    ? {
        title:
          "San Pya Invoice | သင့်လုပ်ငန်းအတွက် ပြေစာနှင့် စီမံခန့်ခွဲမှုစနစ်",
        description:
          "၂၅,၀၀၀ ကျပ်မှ စတင်သော စံပြ အစီအစဉ်များ။ ပြေစာဖန်တီးခြင်း၊ ပြည်တွင်းငွေပေးချေမှု QR၊ ကိုယ်ပိုင်အမှတ်တံဆိပ်နှင့် အဖွဲ့စီမံခန့်ခွဲမှုများ။",
      }
    : {
        title: "San Pya Invoice | Plans for Your Business",
        description:
          "Advanced B2B invoice and management solution. Explore San Pya plans from 25,000 MMK with invoicing, local payment QR integration, custom branding, and team management.",
      };
}

const features = [
  {
    image: "team",
    title: "Multi-Tier User Control",
    description: "Company Admin & Staff Accounts",
    tone: "mint",
  },
  {
    image: "invoice",
    title: "Dynamic Invoice Engine",
    description: "Auto-numbering & Calculations",
    tone: "peach",
  },
  {
    image: "payments",
    title: "Instant Local Payments",
    description: "KPay / Wave / Bank QR Integration",
    tone: "butter",
  },
  {
    image: "branding",
    title: "Custom Branding",
    description: "Company Logo & Digital Signature",
    tone: "rose",
  },
  {
    image: "print",
    title: "Print & Export Ready",
    description: "A4 Clean Print CSS & PDF Export",
    tone: "butter",
  },
  {
    image: "catalog",
    title: "Client & Product Catalog",
    description: "Quick Select Directory",
    tone: "mint",
  },
  {
    image: "analytics",
    title: "Revenue & Unpaid Analytics",
    description: "Real-time Dashboard",
    tone: "rose",
  },
  {
    image: "security",
    title: "Cloud Sync & Data Security",
    description: "Automatic Backup",
    tone: "peach",
  },
];

function salesContact() {
  const value = process.env.SALES_CONTACT_URL;
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "mailto:", "tel:"].includes(url.protocol)
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

export default async function Home() {
  const locale = landingLocale((await cookies()).get(LANGUAGE_COOKIE)?.value);
  const t = (text: string) => translate(locale, text);
  return (
    <div className="landing-page" lang={locale}>
      <a className="landing-skip" href="#main">
        {t("Skip to content")}
      </a>
      <header className="landing-header">
        <Link href="/" aria-label={t("San Pya home")}>
          <Brand />
        </Link>
        <nav className="landing-nav" aria-label={t("Website navigation")}>
          <a href="#features">{t("Features")}</a>
          <a href="#pricing">{t("Pricing")}</a>
          <a href="#how-it-works">{t("How it works")}</a>
          <a href="#download-app">{t("Download app")}</a>
        </nav>
        <div className="landing-header-actions">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle locale={locale} />
          <LandingGetAppButton locale={locale} variant="header" />
          <Link className="button button-secondary" href="/login">
            {t("Sign in")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>
      <main id="main">
        <section className="landing-hero" aria-labelledby="hero-title">
          <div className="landing-hero-copy">
            <span className="landing-kicker">
              <span /> {t("YOUR BUSINESS, A LITTLE MORE BRILLIANT")}
            </span>
            <h1 id="hero-title">
              <span lang="my" className="san-pya-name">
                စံပြ
              </span>
              <br />
              <span>{t("Invoice Generator")}</span>
              <Sparkles className="hero-sparkle" size={34} aria-hidden="true" />
            </h1>
            <p className="landing-subtitle">
              {t("ADVANCED B2B INVOICE & MANAGEMENT SOLUTION")}
            </p>
            <p className="landing-lede">
              {t("Big dreams. Busy days. Beautiful invoices.")}
              <br />
              {t(
                "A happy little workspace for your clients, your team, and every payment in between.",
              )}
            </p>
            <div className="landing-hero-actions">
              <a className="button button-primary" href="#pricing">
                {t("Find your plan")}
                <ArrowDown size={17} />
              </a>
              <LandingGetAppButton locale={locale} variant="hero" />
              <a className="landing-quiet-link" href="#features">
                {t("Meet your new workspace")}
                <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="landing-hero-notes">
              <span>
                <Check size={15} /> {t("From 25,000 MMK")}
              </span>
              <span>
                <Heart size={15} /> {t("Made for growing businesses")}
              </span>
            </div>
          </div>
          <div
            className="landing-illustration"
            aria-label={t("Illustrative invoice preview")}
          >
            <div className="hero-orbit" aria-hidden="true" />
            <span className="hero-float hero-float-top">
              <CheckCheck size={19} /> {t("Less admin. More happy.")}
            </span>
            <div className="hero-invoice">
              <div className="hero-invoice-header">
                <Brand />
                <span>
                  {t("INVOICE")}
                  <br />
                  <small>{t("SAMPLE / 001")}</small>
                </span>
              </div>
              <div className="hero-invoice-title">
                <span>{t("Good work deserves")}</span>
                <strong>{t("a great invoice.")}</strong>
              </div>
              <div className="hero-invoice-client">
                <span>{t("PREPARED WITH CARE")}</span>
                <strong>{t("Your next big idea")}</strong>
              </div>
              <div className="hero-invoice-row">
                <span>{t("Creative work")}</span>
                <strong>150,000</strong>
              </div>
              <div className="hero-invoice-row">
                <span>{t("The little details")}</span>
                <strong>25,000</strong>
              </div>
              <div className="hero-invoice-total">
                <span>
                  {t("Total")}
                  <small>{t("MMK")}</small>
                </span>
                <strong>175,000</strong>
              </div>
              <div className="hero-invoice-foot">
                <span>{t("Thank you for your business!")}</span>
                <Heart size={17} />
              </div>
            </div>
            <div className="hero-float hero-payment">
              <span className="hero-payment-icon">
                <QrCode size={24} />
              </span>
              <span>
                <strong>{t("Local payments, made easy")}</strong>
                <small>KPay · Wave · Bank QR</small>
              </span>
            </div>
            <div className="landing-mascot" aria-hidden="true">
              <span className="receipt-eyes">
                <i />
                <i />
              </span>
              <span className="receipt-smile" />
              <Sparkles size={22} />
            </div>
            <span className="hero-handnote" aria-hidden="true">
              {t("a little less paperwork, please.")}
            </span>
          </div>
        </section>
        <div
          className="landing-ribbon"
          aria-label={t("Designed for your business")}
        >
          <span>
            <Heart size={17} /> {t("For the work you love")}
          </span>
          <i />
          <span>{t("Freelancers")}</span>
          <i />
          <span>{t("Small businesses")}</span>
          <i />
          <span>{t("Growing teams")}</span>
          <i />
          <span>{t("B2B companies")}</span>
        </div>
        <section
          className="landing-section landing-pricing"
          id="pricing"
          aria-labelledby="pricing-title"
        >
          <div className="landing-section-heading">
            <span className="landing-kicker">
              <Sparkles size={15} /> {t("A LITTLE PLAN. A LOT OF POSSIBILITY.")}
            </span>
            <h2 id="pricing-title">{t("Your pace. Your plan.")}</h2>
            <p>
              {t(
                "All the essentials in every plan. Pick how long you'd like to stay.",
              )}
            </p>
          </div>
          <PricingPlans
            key={locale}
            locale={locale}
            contactUrl={salesContact()}
          />
          <p className="pricing-footnote">
            <Check size={15} />{" "}
            {t(
              "Prices shown in MMK for the full plan period. Bonus time is added to your plan.",
            )}
          </p>
        </section>
        <section
          className="landing-section landing-features"
          id="features"
          aria-labelledby="features-title"
        >
          <div className="landing-section-heading">
            <span className="landing-kicker">
              <Heart size={15} /> {t("THE GOOD STUFF COMES STANDARD")}
            </span>
            <h2 id="features-title">{t("All plans include.")}</h2>
            <p>{t("Everything you need to keep business moving.")}</p>
          </div>
          <div className="landing-feature-grid">
            {features.map(({ image, title, description, tone }) => (
              <article className={`landing-feature ${tone}`} key={title}>
                <div className="landing-feature-art" aria-hidden="true">
                  <Image
                    src={`/images/features/${image}.webp`}
                    width={640}
                    height={480}
                    sizes="(max-width: 520px) 280px, (max-width: 1100px) 340px, 280px"
                    alt=""
                  />
                </div>
                <div>
                  <h3>{t(title)}</h3>
                  <p>{t(description)}</p>
                </div>
                <Check
                  size={16}
                  className="feature-check"
                  aria-label={t("Included")}
                />
              </article>
            ))}
          </div>
        </section>
        <section
          className="landing-section landing-how"
          id="how-it-works"
          aria-labelledby="how-title"
        >
          <div className="landing-section-heading">
            <span className="landing-kicker">
              {t("FROM HELLO TO YOUR FIRST INVOICE")}
            </span>
            <h2 id="how-title">{t("Small steps. Brilliant start.")}</h2>
          </div>
          <ol className="landing-steps">
            <li>
              <span>01</span>
              <h3>{t("Pick your happy plan")}</h3>
              <p>{t("Choose the billing period that fits your business.")}</p>
            </li>
            <li>
              <span>02</span>
              <h3>{t("Make it yours")}</h3>
              <p>
                {t(
                  "Arrange activation with your San Pya representative, then add your brand and team.",
                )}
              </p>
            </li>
            <li>
              <span>03</span>
              <h3>{t("Send a little brilliance")}</h3>
              <p>
                {t(
                  "Create your first invoice and keep your payments beautifully in order.",
                )}
              </p>
            </li>
          </ol>
        </section>
        <DownloadAppSection locale={locale} />
        <section className="landing-closing" aria-labelledby="closing-title">
          <span className="landing-kicker">
            <Sparkles size={16} /> {t("MORE TIME FOR WHAT YOU DO BEST")}
          </span>
          <h2 id="closing-title">
            {t("Manage Invoices Smarter,")}
            <br />
            <span>{t("Grow Your Business Faster")}</span>
          </h2>
          <a className="button button-primary" href="#pricing">
            {t("Let's make it brilliant")}
            <ArrowUpRight size={18} />
          </a>
        </section>
        <div className="landing-trust" aria-label={t("Our commitments")}>
          <span>
            <ShieldCheck size={23} /> {t("SAFE & SECURE DATA")}
          </span>
          <span>
            <Headphones size={23} /> {t("24/7 TECHNICAL SUPPORT")}
          </span>
          <span>
            <Cloud size={23} /> {t("AUTOMATIC CLOUD BACKUP")}
          </span>
        </div>
      </main>
      <footer className="landing-footer">
        <div>
          <Brand />
          <p>{t("Manage Invoices Smarter, Grow Your Business Faster")}</p>
        </div>
        <nav aria-label={t("Footer navigation")}>
          <a href="#download-app">{t("Download app")}</a>
          <a href="#pricing">{t("Explore plans")}</a>
          <Link href="/login">
            {t("Sign in to your workspace")}
            <ArrowUpRight size={15} />
          </Link>
        </nav>
        <span>San Pya Invoice</span>
      </footer>
    </div>
  );
}
