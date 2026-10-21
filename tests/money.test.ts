import test from "node:test";
import assert from "node:assert/strict";
import { calculate, statusOf } from "../src/lib/money.ts";
const base = {
  items: [
    { id: "a", description: "Design", quantity: "2", price: "450.00" },
    { id: "b", description: "Development", quantity: "1", price: "600.00" },
  ],
  discountType: "PERCENT" as const,
  discount: "10",
  tax: "7",
};
test("discount is applied before tax with exact minor-unit rounding", () => {
  assert.deepEqual(calculate(base), {
    lines: [90000, 60000],
    subtotal: 150000,
    discount: 15000,
    tax: 9450,
    total: 144450,
  });
});
test("fractional quantities and half-cent rounding are deterministic", () => {
  assert.equal(
    calculate({
      ...base,
      items: [{ id: "a", description: "x", price: "0.01", quantity: "0.5" }],
      discount: "0",
      tax: "0",
    }).total,
    1,
  );
});
test("fixed discount and zero tax", () => {
  assert.equal(
    calculate({ ...base, discountType: "FIXED", discount: "100", tax: "0" })
      .total,
    140000,
  );
});
test("reject malformed values and excessive adjustments", () => {
  for (const patch of [
    { discount: "101" },
    { tax: "101" },
    { discount: "-1" },
    { tax: "NaN" },
    { discountType: "FIXED" as const, discount: "1500.01" },
  ])
    assert.throws(() => calculate({ ...base, ...patch }));
  assert.throws(() =>
    calculate({
      ...base,
      items: [{ id: "x", description: "x", price: "1", quantity: "0" }],
    }),
  );
});
test("only unpaid invoices past the due date are overdue", () => {
  assert.equal(
    statusOf({ status: "UNPAID", dueDate: "2026-10-19" }, "2026-10-20"),
    "OVERDUE",
  );
  assert.equal(
    statusOf({ status: "UNPAID", dueDate: "2026-10-20" }, "2026-10-20"),
    "UNPAID",
  );
  assert.equal(
    statusOf({ status: "DRAFT", dueDate: "2026-01-01" }, "2026-10-20"),
    "DRAFT",
  );
  assert.equal(
    statusOf({ status: "PAID", dueDate: "2026-01-01" }, "2026-10-20"),
    "PAID",
  );
});
