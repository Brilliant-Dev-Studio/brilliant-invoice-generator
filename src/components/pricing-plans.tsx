"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Gift, Sparkles, Star } from "lucide-react";
import { translate, type LandingLocale } from "@/lib/landing-language";
import { PLANS } from "@/lib/plans";
import { Dialog } from "./ui/dialog";

const plans = [
  {
    ...PLANS.MONTHLY,
    period: "1 month",
    periodMy: "၁ လစာ",
    targetEn:
      "For small businesses and freelancers who want to try the system before committing to a longer plan.",
    price: PLANS.MONTHLY.priceMMK.toLocaleString("en-US"),
    caption: "A lovely place to start",
    target:
      "စနစ်ကို အစောပိုင်း အကြိုအစမ်း သုံးကြည့်ချင်သည့် လုပ်ငန်းငယ်များနှင့် Freelancers များ။",
    tone: "peach",
  },
  {
    ...PLANS.QUARTERLY,
    period: "3 months",
    periodMy: "၃ လစာ",
    targetEn:
      "For SMEs that prefer paying once every three months instead of monthly.",
    price: PLANS.QUARTERLY.priceMMK.toLocaleString("en-US"),
    caption: "Settle into your rhythm",
    target: "လစဉ်မပေးချင်ဘဲ ၃ လတစ်ကြိမ် စာရင်းရှင်းလိုသည့် SMEs များ။",
    tone: "mint",
  },
  {
    ...PLANS.HALF_YEAR,
    period: "6 months",
    periodMy: "၆ လစာ",
    targetEn:
      "For business owners who want a balanced commitment with extra bonus days.",
    price: PLANS.HALF_YEAR.priceMMK.toLocaleString("en-US"),
    caption: "More room to grow",
    target:
      "လစဉ် သက်သာခွင့်နှင့် အပိုရက်Bonus ကို မျှတစွာ လိုချင်သည့် လုပ်ငန်းရှင်များ။",
    tone: "butter",
  },
  {
    ...PLANS.YEARLY,
    period: "1 year",
    periodMy: "၁ နှစ်စာ",
    targetEn:
      "For companies and B2B SaaS clients seeking the most bonus time with an annual commitment.",
    price: PLANS.YEARLY.priceMMK.toLocaleString("en-US"),
    caption: "A whole year of possibility",
    target:
      "နှစ်ချုပ် စာချုပ်ဖြင့် သက်သာခွင့် အများဆုံး ယူလိုသည့် ကုမ္ပဏီများနှင့် B2B SaaS Clients များ။",
    tone: "rose",
  },
] as const;
type Plan = (typeof plans)[number];

export function PricingPlans({
  contactUrl,
  locale,
}: {
  contactUrl?: string;
  locale: LandingLocale;
}) {
  const t = (text: string) => translate(locale, text);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const summary = selected
    ? `San Pya Invoice\n${t(selected.name)}\n${t("Price")}: ${selected.price} ${t("MMK")}\n${t("Bonus")}: ${t(selected.bonus)}\n${t("I would like to activate this plan for my business.")}`
    : "";
  return (
    <>
      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <article
            className={`pricing-card ${plan.tone} ${index === 3 ? "pricing-popular" : ""}`}
            key={t(plan.name)}
          >
            {index === 3 && (
              <span className="pricing-popular-label">
                <Star size={13} fill="currentColor" />{" "}
                {t("BEST VALUE / MOST POPULAR")}
              </span>
            )}
            <div className="pricing-card-top">
              <span className="pricing-number">0{index + 1}</span>
              {index === 3 ? <Star size={24} /> : <Sparkles size={22} />}
            </div>
            <h3>{t(plan.name)}</h3>
            <p className="pricing-caption">{t(plan.caption)}</p>
            <div className="pricing-price">
              <strong>{plan.price}</strong>
              <span>{t("MMK")}</span>
            </div>
            <p className="pricing-period">
              {locale === "my"
                ? `${plan.periodMy} · ကြိုတင်ပေးချေရန်`
                : `per ${plan.period} · billed upfront`}
            </p>
            <div className={`pricing-bonus ${index === 0 ? "no-bonus" : ""}`}>
              {index === 0 ? (
                <>
                  <span>{t("Bonus")}</span>
                  <span aria-label={t("No bonus")}>-</span>
                </>
              ) : (
                <>
                  <Gift size={18} />
                  <strong>{t(plan.bonus)}</strong>
                </>
              )}
            </div>
            <p className="pricing-target" lang={locale}>
              {locale === "my" ? plan.target : plan.targetEn}
            </p>
            <span className="pricing-included">
              <Check size={15} /> {t("All features included")}
            </span>
            <button
              type="button"
              className={`button ${index === 3 ? "button-primary" : "button-secondary"}`}
              aria-label={`${t("Choose plan")}: ${t(plan.name)}`}
              onClick={() => {
                setSelected(plan);
                setCopyStatus("");
              }}
            >
              {t("Choose plan")}
              <ArrowUpRight size={17} />
            </button>
          </article>
        ))}
      </div>
      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={t("Your next brilliant chapter")}
        closeLabel={t("Close dialog")}
      >
        {selected && (
          <div className="plan-request">
            <p className="landing-kicker">{t(selected.name)}</p>
            <p className="plan-request-price">
              {selected.price} <span>{t("MMK")}</span>
            </p>
            {selected.bonus !== "-" && (
              <p className="pricing-bonus">
                <Gift size={18} /> {t(selected.bonus)}
              </p>
            )}
            <p>
              {t(
                "Share your selected plan with your San Pya representative to arrange payment and activate your company workspace.",
              )}
            </p>
            {contactUrl && (
              <a className="button button-primary" href={contactUrl}>
                {t("Contact San Pya")}
                <ArrowUpRight size={17} />
              </a>
            )}
            <button
              className="button button-secondary"
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(summary);
                  setCopyStatus(
                    "Plan details copied. You can paste them into your message.",
                  );
                } catch {
                  setCopyStatus(
                    "Select and copy the plan details below to share them.",
                  );
                }
              }}
            >
              <Copy size={16} /> {t("Copy plan details")}
            </button>
            <details>
              <summary>{t("View request details")}</summary>
              <pre>{summary}</pre>
            </details>
            {copyStatus && (
              <p className="message" role="status">
                {t(copyStatus)}
              </p>
            )}
            <Link className="landing-quiet-link" href="/login">
              {t("Already have an account? Sign in")}
              <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
      </Dialog>
    </>
  );
}
