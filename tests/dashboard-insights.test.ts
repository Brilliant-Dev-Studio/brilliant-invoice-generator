import test from "node:test";
import assert from "node:assert/strict";
import { dashboardInsights } from "../src/lib/dashboard-insights.ts";
import type { Invoice } from "../src/lib/types.ts";

const invoice = (overrides: Partial<Invoice> = {}): Invoice => ({
  id: "invoice",
  companyId: "company",
  number: "INV-1",
  clientId: "client",
  title: "Project",
  currency: "USD",
  issueDate: "2026-01-01",
  dueDate: "2026-02-01",
  terms: "",
  items: [],
  discountType: "FIXED",
  discount: "0",
  tax: "0",
  payment: "",
  status: "UNPAID",
  paidAt: null,
  revision: 1,
  createdAt: "2026-01-01T00:00:00Z",
  company: {
    id: "company",
    name: "Studio",
    address: "",
    phone: "",
    email: "",
    taxId: "",
    logo: "",
    signature: "",
    kpay: "",
    wavepay: "",
    bank: "",
  },
  client: {
    id: "client",
    companyId: "company",
    name: "Client",
    address: "",
    phone: "",
    email: "",
  },
  totals: { lines: [], subtotal: 10000, discount: 0, tax: 0, total: 10000 },
  ...overrides,
});

test("six-month history spans years and groups payments in Yangon time", () => {
  const result = dashboardInsights(
    [invoice({ status: "PAID", paidAt: "2026-01-31T18:00:00Z" })],
    "USD",
    "2026-02-20",
  );
  assert.deepEqual(
    result.series.map((point) => point.key),
    ["2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02"],
  );
  assert.equal(result.series[4].total, 0);
  assert.equal(result.series[5].total, 10000);
});

test("collection excludes drafts and other currencies; attention puts oldest overdue first", () => {
  const result = dashboardInsights(
    [
      invoice({ id: "draft", status: "DRAFT" }),
      invoice({ id: "recent", dueDate: "2026-02-19" }),
      invoice({ id: "oldest", dueDate: "2026-01-01" }),
      invoice({ id: "paid", status: "PAID", paidAt: "2026-02-01T00:00:00Z" }),
      invoice({
        id: "other-currency",
        currency: "MMK",
        status: "PAID",
        paidAt: "2026-02-01T00:00:00Z",
      }),
    ],
    "USD",
    "2026-02-20",
  );
  assert.equal(result.collected, 10000);
  assert.equal(result.issued, 30000);
  assert.equal(result.percentage, 33);
  assert.deepEqual(
    result.priorities.map((item) => item.id),
    ["oldest", "recent", "draft"],
  );
});

test("empty workspaces have zero totals and no invalid chart scale", () => {
  const result = dashboardInsights([], "USD", "2026-02-20");
  assert.equal(result.percentage, 0);
  assert.equal(result.collected, 0);
  assert.equal(result.maximum, 1);
  assert.equal(result.priorities.length, 0);
});
