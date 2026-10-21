import test from "node:test";
import assert from "node:assert/strict";
import {
  planTerm,
  validPlanDate,
  subscriptionStatus,
  companyPlan,
  platformSummary,
  type Subscription,
} from "../src/lib/plans.ts";

test("catalog prices and bonuses produce calendar-based expiry dates", () => {
  for (const [id, price, end] of [
    ["MONTHLY", 25000, "2026-02-15"],
    ["QUARTERLY", 75000, "2026-04-18"],
    ["HALF_YEAR", 150000, "2026-07-22"],
    ["YEARLY", 300000, "2027-02-15"],
  ] as const) {
    const term = planTerm(id, "2026-01-15");
    assert.equal(term.priceMMK, price);
    assert.equal(term.expiresOn, end);
  }
});
test("month ends clamp, including leap years and the annual bonus", () => {
  assert.equal(planTerm("MONTHLY", "2026-01-31").expiresOn, "2026-02-28");
  assert.equal(planTerm("MONTHLY", "2024-01-31").expiresOn, "2024-02-29");
  assert.equal(planTerm("YEARLY", "2024-02-29").expiresOn, "2025-03-29");
  assert.equal(planTerm("YEARLY", "2026-01-31").expiresOn, "2027-02-28");
});
test("invalid or unbounded dates are rejected", () => {
  for (const date of [
    "",
    "2026-02-29",
    "2026-04-31",
    "2026-1-01",
    "garbage",
    "9999-12-31",
  ]) {
    assert.equal(validPlanDate(date), false);
    assert.throws(() => planTerm("MONTHLY", date));
  }
  assert.equal(validPlanDate("2024-02-29"), true);
});
const term = (id: string, start: string, companyId = "a"): Subscription => ({
  id,
  companyId,
  ...planTerm("MONTHLY", start),
});
test("expiry is exclusive and queued renewals replace expired coverage", () => {
  const first = term("1", "2026-01-01"),
    next = term("2", "2026-02-01");
  assert.equal(subscriptionStatus(first, "2025-12-31"), "SCHEDULED");
  assert.equal(subscriptionStatus(first, "2026-01-01"), "ACTIVE");
  assert.equal(subscriptionStatus(first, "2026-02-01"), "EXPIRED");
  assert.equal(companyPlan([next, first], "2026-01-20")?.id, "1");
  assert.equal(companyPlan([first, next], "2026-02-01")?.id, "2");
  assert.equal(companyPlan([next, first], "2025-12-31")?.id, "1");
  assert.equal(companyPlan([next, first], "2026-04-01")?.id, "2");
});
test("reports count companies once and sum only their recorded terms", () => {
  const companies = ["a", "b", "c", "d"].map((id) => ({
    id,
    name: id,
    accountCount: 12,
  }));
  const terms = [
    term("1", "2026-01-01"),
    term("2", "2026-02-01"),
    term("3", "2025-01-01", "b"),
    term("4", "2027-01-01", "d"),
    term("5", "2026-01-01", "outside"),
  ];
  const summary = platformSummary(companies, terms, "2026-01-20");
  assert.equal(summary.clients, 4);
  assert.equal(summary.active, 1);
  assert.equal(summary.scheduled, 1);
  assert.equal(summary.expired, 1);
  assert.equal(summary.unassigned, 1);
  assert.equal(summary.byPlan.MONTHLY, 3);
  assert.equal(summary.totalMMK, 100000);
});
