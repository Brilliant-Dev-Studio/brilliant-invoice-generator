import Link from "next/link";
import { ArrowUpRight, Clock3, FilePenLine } from "lucide-react";
import { MascotWidget } from "./MascotWidget";
import { money } from "@/lib/money";
import { dashboardInsights } from "@/lib/dashboard-insights";
import type { Currency, Invoice } from "@/lib/types";
import { T } from "@/components/language-provider";

export function DashboardInsights({
  invoices,
  currency,
  date,
}: {
  invoices: Invoice[];
  currency: Currency;
  date: string;
}) {
  const {
    series,
    maximum,
    collected,
    overdue,
    drafts,
    priorities,
    paid,
    outstanding,
    issued,
    percentage,
  } = dashboardInsights(invoices, currency, date);

  return (
    <>
      <div className="business-insights">
        <section className="revenue-panel" aria-labelledby="revenue-title">
          <div className="insight-heading">
            <div>
              <span className="insight-kicker">
                <T text="THE BIGGER PICTURE" />
              </span>
              <h2 id="revenue-title">
                <T text="Revenue, in perspective." />
              </h2>
            </div>
            <span className="period-chip">
              <T text="6 months /" /> {currency}
            </span>
          </div>
          <div className="revenue-amount">
            <strong>{money(collected, currency)}</strong>
            <span>
              <T text="Total collected over the last six months" />
            </span>
          </div>
          {collected === 0 ? (
            <div className="revenue-empty">
              <MascotWidget character="revenue" compact />
              <span>
                <T text="A little quiet. A lot of possibility." />
              </span>
            </div>
          ) : (
            <div
              className="revenue-chart"
              role="img"
              aria-label={`Monthly payments received in ${currency}. ${series.map((point) => `${point.key}: ${money(point.total, currency)}`).join(". ")}`}
            >
              {series.map((point, index) => (
                <div
                  className={`revenue-column ${index === 5 ? "current" : ""}`}
                  key={point.key}
                  aria-hidden="true"
                >
                  <div className="revenue-track">
                    <div
                      className="revenue-bar"
                      style={{ height: `${(point.total / maximum) * 100}%` }}
                    />
                  </div>
                  <span>
                    <T text={point.label} />
                  </span>
                </div>
              ))}
            </div>
          )}
          <details className="revenue-data">
            <summary>
              <T text="View monthly amounts" />
            </summary>
            <dl>
              {series.map((point) => (
                <div key={point.key}>
                  <dt>{point.key}</dt>
                  <dd>{money(point.total, currency)}</dd>
                </div>
              ))}
            </dl>
          </details>
          <p className="revenue-caption">
            {collected ? (
              <T text="Payments recorded by payment date. Current month is in progress." />
            ) : (
              <T text="Your first recorded payment starts the story. No payments recorded in this period." />
            )}
          </p>
        </section>
        <section className="attention-panel" aria-labelledby="attention-title">
          <div className="insight-heading">
            <div>
              <span className="insight-kicker">
                <T text="YOUR NEXT MOVE" />
              </span>
              <h2 id="attention-title">
                <T text="Needs your attention" />
              </h2>
            </div>
            <span className="attention-count">
              {overdue.length + drafts.length}
            </span>
          </div>
          <p className="attention-description">
            {overdue.length} <T text="overdue ·" /> {drafts.length}{" "}
            <T text="drafts ·" /> {currency}
          </p>
          <div className="attention-list">
            {priorities.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/dashboard/invoices/${invoice.id}${invoice.status === "DRAFT" ? "?edit=true" : ""}`}
                className="attention-item"
              >
                <span
                  className={`attention-icon ${invoice.status === "DRAFT" ? "draft" : "late"}`}
                >
                  {invoice.status === "DRAFT" ? (
                    <FilePenLine size={19} />
                  ) : (
                    <Clock3 size={19} />
                  )}
                </span>
                <span>
                  <strong>{invoice.client.name}</strong>
                  <small>
                    {invoice.status === "DRAFT" ? (
                      <T text="Ready to finish" />
                    ) : (
                      <T text="Due {date}" values={{ date: invoice.dueDate }} />
                    )}{" "}
                    / {invoice.number}
                  </small>
                  <b>{money(invoice.totals.total, currency)}</b>
                </span>
                <ArrowUpRight size={17} />
              </Link>
            ))}
            {!priorities.length && (
              <div className="attention-empty">
                <MascotWidget character="complete" compact />
                <h3>
                  <T text="You're all caught up." />
                </h3>
                <p>
                  <T text="No overdue invoices or unfinished drafts in" />{" "}
                  {currency}.
                </p>
              </div>
            )}
          </div>
          <Link
            className="text-link attention-footer"
            href="/dashboard/invoices"
          >
            <T text="Manage invoices" /> <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>
      <section
        className="collection-strip"
        aria-label={`Collection progress for ${currency}`}
      >
        <div>
          <span className="insight-kicker">
            <T text="COLLECTION HEALTH" />
          </span>
          <h2>
            {issued ? (
              <T
                text="{percentage}% of issued value collected"
                values={{ percentage }}
              />
            ) : (
              <T text="Ready for your first invoice" />
            )}
          </h2>
          <p>
            <T text="All-time totals in" /> {currency}
            <T text=". Drafts excluded." />
          </p>
        </div>
        <div className="collection-progress">
          <div className="collection-labels">
            <span>
              <T text="Paid" /> <strong>{money(paid, currency)}</strong>
            </span>
            <span>
              <T text="Outstanding" />{" "}
              <strong>{money(outstanding, currency)}</strong>
            </span>
          </div>
          <div
            className="collection-track"
            role="meter"
            aria-label="Issued invoice value collected"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${percentage}%` }} />
          </div>
        </div>
      </section>
    </>
  );
}
