import test from "node:test";
import assert from "node:assert/strict";
import { demoSeed } from "../src/lib/demo.ts";
import { DEMO_COMPANY_ID, isDemoCompany } from "../src/lib/demo-config.ts";
import { authorizedCron } from "../src/lib/cron-auth.ts";
import { calculate, statusOf } from "../src/lib/money.ts";

test("demo seed covers invoice states with consistent totals and references", () => {
  const seed = demoSeed("2026-01-01");
  assert.equal(seed.customers.length, 3);
  assert.equal(seed.brand.products.length, 3);
  assert.deepEqual(
    seed.invoices.map((i) => statusOf(i, "2026-01-01")),
    ["PAID", "UNPAID", "DRAFT", "OVERDUE"],
  );
  for (const invoice of seed.invoices) {
    assert.equal(invoice.companyId, DEMO_COMPANY_ID);
    assert.ok(seed.customers.some((c) => c.id === invoice.clientId));
    assert.deepEqual(invoice.totals, calculate(invoice));
    assert.match(invoice.number, /^INV-2026-000[1-4]$/);
  }
});

test("demo identity cannot be inferred from a public email", () => {
  assert.equal(isDemoCompany(DEMO_COMPANY_ID), true);
  assert.equal(isDemoCompany("demo@sanpya.com"), false);
  assert.equal(isDemoCompany("ordinary-company"), false);
});

test("reset authorization fails closed and requires an exact bearer secret", () => {
  const secret = "test-secret-".repeat(4);
  assert.equal(authorizedCron(`Bearer ${secret}`, secret), true);
  for (const value of [
    null,
    "",
    secret,
    `Bearer ${secret}x`,
    `Bearer ${"x".repeat(secret.length)}`,
  ])
    assert.equal(authorizedCron(value, secret), false);
  assert.equal(authorizedCron("Bearer short", "short"), false);
  assert.equal(authorizedCron("Bearer undefined", ""), false);
});
