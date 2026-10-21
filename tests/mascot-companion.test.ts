import test from "node:test";
import assert from "node:assert/strict";
import { companionMessages } from "../src/lib/mascot-companion.ts";
import { platformMyanmar } from "../src/lib/platform-language.ts";

test("account encouragement uses real issued and paid counts", () => {
  const messages = companionMessages(
    { total: 8, issued: 5, paid: 2, drafts: 3 },
    9,
    null,
  );
  assert.deepEqual(messages[0].values, { count: 5 });
  assert.deepEqual(messages[1].values, { count: 2 });
  assert.ok(messages.some((m) => m.text.includes("morning")));
});
test("unavailable account data never claims zero invoices or payments", () => {
  const messages = companionMessages(null, 23, null);
  assert.ok(messages[0].text.includes("quiet night"));
  assert.ok(messages.every((m) => !m.text.includes("invoice")));
  assert.ok(
    companionMessages(
      { total: 1, issued: 0, paid: 0, drafts: 1 },
      14,
      null,
    )[0].text.includes("draft"),
  );
});
test("weather is conditional and all contextual messages have Myanmar translations", () => {
  for (const hour of [2, 9, 14, 19, 23]) {
    for (const stats of [
      null,
      { total: 0, issued: 0, paid: 0, drafts: 0 },
      { total: 4, issued: 3, paid: 2, drafts: 1 },
      { total: 1, issued: 0, paid: 0, drafts: 1 },
    ]) {
      for (const weather of [
        null,
        { temperature: 25, code: 61 },
        { temperature: 35, code: 0 },
        { temperature: 15, code: 3 },
        { temperature: 25, code: 0 },
        { temperature: 25, code: 3 },
      ]) {
        for (const message of companionMessages(stats, hour, weather))
          assert.ok(platformMyanmar[message.text], message.text);
      }
    }
  }
  assert.ok(
    companionMessages(null, 12, { temperature: 23, code: 95 }).some((m) =>
      m.text.includes("Rain"),
    ),
  );
  assert.ok(
    !companionMessages(null, 12, null).some((m) => m.text.includes("Rain")),
  );
});
