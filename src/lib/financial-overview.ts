import { z } from "zod";
import type { Currency } from "./types.ts";

const amount = z
  .string()
  .trim()
  .regex(/^\d{1,12}(\.\d{1,2})?$/)
  .or(z.literal(""));
export const overviewInputSchema = z.object({
  currency: z.enum(["MMK", "USD", "THB"]),
  revenue: amount,
  outstanding: amount,
  count: z
    .string()
    .trim()
    .regex(/^\d{1,9}$/)
    .or(z.literal("")),
});
export type OverviewSettings = {
  currencies?: Partial<
    Record<Currency, { revenue?: number; month?: string; outstanding?: number }>
  >;
  count?: number;
};
export function overviewAmounts(
  settings: OverviewSettings | undefined,
  currency: Currency,
  month: string,
  calculated: { revenue: number; outstanding: number; count: number },
) {
  const selected = settings?.currencies?.[currency];
  const revenue = selected?.month === month ? selected.revenue : undefined;
  return {
    revenue: revenue ?? calculated.revenue,
    outstanding: selected?.outstanding ?? calculated.outstanding,
    count: settings?.count ?? calculated.count,
    manualRevenue: revenue !== undefined,
    manualOutstanding: selected?.outstanding !== undefined,
    manualCount: settings?.count !== undefined,
  };
}
export function amountInMinorUnits(value: string) {
  if (!value) return undefined;
  const [whole, decimal = ""] = value.split(".");
  return Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
}
