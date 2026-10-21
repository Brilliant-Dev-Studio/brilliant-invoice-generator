import { DemoLogin } from "@/components/demo-login";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/login-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-provider";
import { COOKIE, readSession } from "@/lib/session";
import { T } from "@/components/language-provider";
import { getTranslations } from "@/lib/server-language";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const t = await getTranslations();
  const { user } = await readSession((await cookies()).get(COOKIE)?.value);
  if (user) redirect(user.role === "SUPERADMIN" ? "/superadmin" : "/dashboard");
  const params = await searchParams;
  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand-row">
          <Link href="/" aria-label={t("San Pya home")}>
            <Brand />
          </Link>
          <div className="workspace-tools">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="login-story-content">
          <span className="eyebrow">
            <T text="LESS ADMIN. MORE AMBITION." />
          </span>
          <h1>
            <T text="Good work." />
            <br />
            <T text="Great invoices" />
            <span>.</span>
          </h1>
          <p>
            <T text="From the first line item to the final payment." />
            <br />
            <T text="Your business, beautifully in order." />
          </p>
          <div className="login-art">
            <div className="art-top">
              <span className="art-icon">
                <ArrowUpRight />
              </span>
              <span>
                <T text="YOUR NEXT CHAPTER" />
                <br />
                <strong>
                  <T text="Looks brilliant." />
                </strong>
              </span>
            </div>
            <div className="art-line" />
            <div className="art-amount">
              <T text="Made for" />
              <br />
              <em>
                <T text="what comes next." />
              </em>
            </div>
            <div className="art-bottom">
              <span>
                <Check size={14} /> <T text="Simple. Professional. Yours." />
              </span>
              <span>01 / 01</span>
            </div>
          </div>
        </div>
        <span className="login-copyright">San Pya Invoice</span>
      </section>
      <section className="login-form-panel">
        <div className="login-form-wrap">
          <span className="eyebrow">
            <T text="YOUR WORKSPACE AWAITS" />
          </span>
          <h2>
            <T text="Welcome back" />
            <span className="heading-dot">.</span>
          </h2>
          <p className="login-intro">
            <T text="Sign in to keep business moving." />
          </p>
          <LoginForm suspended={params.error === "suspended"} />
          <DemoLogin />
        </div>
        <span className="login-help">
          <T text="Need access? Contact your company administrator." />
        </span>
      </section>
    </main>
  );
}
