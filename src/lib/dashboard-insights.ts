import { statusOf } from "./money.ts";
import type { Currency, Invoice } from "./types.ts";

export function dashboardInsights(
  all: Invoice[],
  currency: Currency,
  date: string,
) {
  const invoices = all.filter((invoice) => invoice.currency === currency);
  const [year, month] = date.split("-").map(Number);
  const monthFormat = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Yangon",
    year: "numeric",
    month: "2-digit",
  });
  const series = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(Date.UTC(year, month - 6 + index, 1));
    const key = start.toISOString().slice(0, 7);
    return {
      key,
      label: start.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
      total: invoices
        .filter(
          (invoice) =>
            invoice.status === "PAID" &&
            invoice.paidAt &&
            monthFormat.format(new Date(invoice.paidAt)) === key,
        )
        .reduce((total, invoice) => total + invoice.totals.total, 0),
    };
  });
  const maximum = Math.max(...series.map((point) => point.total), 1);
  const collected = series.reduce((total, point) => total + point.total, 0);
  const overdue = invoices
    .filter((invoice) => statusOf(invoice, date) === "OVERDUE")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const drafts = invoices.filter((invoice) => invoice.status === "DRAFT");
  const priorities = [...overdue, ...drafts].slice(0, 3);
  const paid = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((total, invoice) => total + invoice.totals.total, 0);
  const outstanding = invoices
    .filter((invoice) => invoice.status === "UNPAID")
    .reduce((total, invoice) => total + invoice.totals.total, 0);
  const issued = paid + outstanding;
  const percentage = issued ? Math.round((paid / issued) * 100) : 0;

  return {
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
  };
}
