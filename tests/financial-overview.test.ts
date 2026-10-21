import test from "node:test";
import assert from "node:assert/strict";
import {
  amountInMinorUnits,
  overviewAmounts,
  overviewInputSchema,
} from "../src/lib/financial-overview.ts";

const calculated = { revenue: 5000, outstanding: 2000, count: 3 };
test("manual zero is respected while other currencies retain calculated totals", () => {
  const settings = {
    currencies: { MMK: { revenue: 0, month: "2026-10", outstanding: 100 } },
    count: 0,
  };
  assert.equal(
    overviewAmounts(settings, "MMK", "2026-10", calculated).revenue,
    0,
  );
  assert.equal(
    overviewAmounts(settings, "USD", "2026-10", calculated).revenue,
    5000,
  );
  assert.equal(
    overviewAmounts(settings, "USD", "2026-10", calculated).count,
    0,
  );
});
test("monthly overrides expire and resetting restores all calculated values", () => {
  const result = overviewAmounts(
    { currencies: { MMK: { revenue: 0, month: "2026-09" } } },
    "MMK",
    "2026-10",
    calculated,
  );
  assert.equal(result.revenue, 5000);
  assert.equal(result.manualRevenue, false);
  assert.deepEqual(overviewAmounts(undefined, "MMK", "2026-10", calculated), {
    ...calculated,
    manualRevenue: false,
    manualOutstanding: false,
    manualCount: false,
  });
});
test("amounts use exact minor units and invalid overrides are rejected", () => {
  assert.equal(amountInMinorUnits("12.34"), 1234);
  assert.equal(amountInMinorUnits("0"), 0);
  assert.equal(amountInMinorUnits(""), undefined);
  const valid = { currency: "MMK", revenue: "", outstanding: "", count: "" };
  assert.equal(overviewInputSchema.safeParse(valid).success, true);
  for (const invalid of [
    { revenue: "-1" },
    { revenue: "1.001" },
    { count: "1.5" },
    { outstanding: "Infinity" },
    { currency: "EUR" },
  ]) {
    assert.equal(
      overviewInputSchema.safeParse({ ...valid, ...invalid }).success,
      false,
    );
  }
});
