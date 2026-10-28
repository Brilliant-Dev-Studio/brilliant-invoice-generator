import { overviewAmounts } from "@/lib/financial-overview";
import { dashboardInsights } from "@/lib/dashboard-insights";
import type { Company, Currency, Invoice } from "./types";

export function mobileOverview(
  company: Company,
  invoices: Invoice[],
  date: string,
) {
  return Object.fromEntries(
    (["MMK", "USD", "THB"] as Currency[]).map((currency) => {
      const insight = dashboardInsights(invoices, currency, date);
      return [
        currency,
        overviewAmounts(company.financialOverview, currency, date.slice(0, 7), {
          revenue: insight.series.at(-1)?.total || 0,
          outstanding: insight.outstanding,
          count: invoices.length,
        }),
      ];
    }),
  );
}
