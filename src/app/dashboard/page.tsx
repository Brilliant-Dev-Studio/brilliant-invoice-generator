import Link from "next/link";
import {
  ArrowUpRight,
  Plus,
  TrendingUp,
  Clock3,
  Files,
  CalendarDays,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { invoices, company } from "@/lib/db";
import { overviewAmounts } from "@/lib/financial-overview";
import { money, today } from "@/lib/money";
import type { Currency } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { InvoiceTable } from "@/components/invoice-table";
import { DashboardInsights } from "@/components/dashboard-insights";
import "./dashboard.css";
import { T } from "@/components/language-provider";
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ currency?: string; error?: string }>;
}) {
  const user = await requireUser();
  const all = await invoices(user.companyId);
  const params = await searchParams;
  const currency: Currency = ["MMK", "USD", "THB"].includes(
    params.currency || "",
  )
    ? (params.currency as Currency)
    : "MMK";
  const selected = all.filter((i) => i.currency === currency),
    month = today().slice(0, 7);
  const paid = selected
    .filter(
      (i) =>
        i.status === "PAID" &&
        i.paidAt &&
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Yangon",
          year: "numeric",
          month: "2-digit",
        }).format(new Date(i.paidAt)) === month,
    )
    .reduce((s, i) => s + i.totals.total, 0);
  const unpaid = selected
    .filter((i) => i.status === "UNPAID")
    .reduce((s, i) => s + i.totals.total, 0);
  const overview = overviewAmounts(
    (await company(user.companyId)).financialOverview,
    currency,
    month,
    { revenue: paid, outstanding: unpaid, count: all.length },
  );
  return (
    <div className="business-dashboard">
      <div className="page-heading business-heading">
        <div>
          <span className="eyebrow">
            <CalendarDays size={14} /> <T text="YOUR BUSINESS, IN FOCUS" />
          </span>
          <h1>
            <T text="Welcome back," /> {user.name.split(" ")[0]}
            <span className="heading-dot">.</span>
          </h1>
          <p>
            <T text="Your work. Your revenue. A clear view of what comes next." />
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <Plus size={17} />
            <T text="Create invoice" />
          </Link>
        </Button>
      </div>
      {params.error === "forbidden" && (
        <p className="message error">
          <T text="Your role does not have access to that page." />
        </p>
      )}
      <div className="section-heading">
        <h2>
          <T text="Financial overview" />
        </h2>
        <div className="currency-tabs">
          {(["MMK", "USD", "THB"] as const).map((c) => (
            <Link
              key={c}
              href={`?currency=${c}`}
              className={currency === c ? "selected" : ""}
              aria-current={currency === c ? "page" : undefined}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
      <div className="stats-grid dashboard-stats">
        <article className="stat-card">
          <div>
            <span>
              <T text="Monthly revenue" />
            </span>
            <TrendingUp size={18} />
          </div>
          <strong>{money(overview.revenue, currency)}</strong>
          <p>
            <span className="live-dot" />{" "}
            <T text={overview.manualRevenue ? "Manual total" : "Paid in"} />{" "}
            {month} · {currency}
          </p>
        </article>
        <article className="stat-card">
          <div>
            <span>
              <T text="Outstanding balance" />
            </span>
            <Clock3 size={18} />
          </div>
          <strong>{money(overview.outstanding, currency)}</strong>
          <p>
            <T
              text={
                overview.manualOutstanding
                  ? "Manual total"
                  : "Unpaid & overdue ·"
              }
            />{" "}
            {currency}
          </p>
        </article>
        <article className="stat-card">
          <div>
            <span>
              <T text="Invoices generated" />
            </span>
            <Files size={18} />
          </div>
          <strong>{overview.count.toString().padStart(2, "0")}</strong>
          <p>
            <T
              text={
                overview.manualCount
                  ? "Manual total"
                  : "All currencies · includes drafts"
              }
            />
          </p>
        </article>
      </div>
      <DashboardInsights
        invoices={selected}
        currency={currency}
        date={today()}
      />
      <section className="panel table-panel">
        <div className="table-title">
          <div>
            <h2>
              <T text="Recent invoices" />
            </h2>
            <p>
              <T text="Your latest work, from draft to payment." />
            </p>
          </div>
          <Link className="text-link" href="/dashboard/invoices">
            <T text="View all invoices" />
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <InvoiceTable invoices={all.slice(0, 6)} />
      </section>
    </div>
  );
}
