import test from "node:test";
import assert from "node:assert/strict";
import { paymentAccountsSchema } from "../src/lib/validation.ts";

test("payment details preserve leading zeros and international prefixes", () => {
  const accounts = paymentAccountsSchema.parse({
    kpay: { name: " Account Owner ", number: " 09123456789 " },
    wavepay: { name: "Wave Owner", number: "+959123456789" },
    bank: { name: "Business", number: "001-002-003" },
  });
  assert.equal(accounts.kpay?.name, "Account Owner");
  assert.equal(accounts.kpay?.number, "09123456789");
  assert.equal(accounts.wavepay?.number, "+959123456789");
  assert.equal(accounts.bank?.number, "001-002-003");
});

test("payment accounts are optional and can be cleared", () => {
  assert.deepEqual(paymentAccountsSchema.parse({}), {});
  assert.deepEqual(
    paymentAccountsSchema.parse({ kpay: { name: "", number: "" } }),
    {
      kpay: { name: "", number: "" },
    },
  );
});

test("payment details reject oversized names and non-text account numbers", () => {
  assert.equal(
    paymentAccountsSchema.safeParse({
      kpay: { name: "x".repeat(251), number: "09" },
    }).success,
    false,
  );
  assert.equal(
    paymentAccountsSchema.safeParse({ bank: { name: "Owner", number: 123 } })
      .success,
    false,
  );
  assert.equal(
    paymentAccountsSchema.safeParse({
      bank: { name: "Owner", number: "1".repeat(101) },
    }).success,
    false,
  );
});
