const test = require("node:test");
const assert = require("node:assert/strict");
const { invoiceStepError } = require("../src/invoice-flow.ts");
const input = {
  clientId: "client",
  title: "Design",
  currency: "MMK",
  issueDate: "2026-10-25",
  dueDate: "2026-11-01",
  terms: "",
  payment: "",
  discountType: "PERCENT",
  discount: "0",
  tax: "0",
  items: [{ id: "item", description: "Identity", price: "100", quantity: "1" }],
};
test("guided invoice flow blocks missing clients before advancing", () => {
  assert.match(invoiceStepError({ ...input, clientId: "" }, 0), /client/);
  assert.equal(invoiceStepError({ ...input, title: "" }, 0), "");
});
test("details step rejects rollover dates and a due date before issue", () => {
  assert.match(
    invoiceStepError({ ...input, dueDate: "2026-02-30" }, 1),
    /dates/,
  );
  assert.match(
    invoiceStepError({ ...input, dueDate: "2026-10-24" }, 1),
    /dates/,
  );
  assert.equal(invoiceStepError(input, 1), "");
});
test("review requires descriptions and valid canonical financial amounts", () => {
  assert.match(invoiceStepError({ ...input, items: [] }, 2), /description/);
  assert.match(
    invoiceStepError(
      { ...input, items: [{ ...input.items[0], description: " " }] },
      2,
    ),
    /description/,
  );
  assert.match(
    invoiceStepError(
      { ...input, items: [{ ...input.items[0], quantity: "0" }] },
      2,
    ),
    /greater than zero/,
  );
  assert.notEqual(invoiceStepError({ ...input, tax: "101" }, 2), "");
  assert.equal(invoiceStepError(input, 2), "");
});
