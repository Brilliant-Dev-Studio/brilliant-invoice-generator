import test from "node:test";
import assert from "node:assert/strict";
import { platformHistory } from "../src/lib/platform-charts.ts";
import { planTerm, type Subscription } from "../src/lib/plans.ts";
const companies = ["a", "b"].map((id) => ({ id, name: id, accountCount: 4 }));
const term = (companyId: string, startsOn: string): Subscription => ({
  id: companyId + startsOn,
  companyId,
  ...planTerm("MONTHLY", startsOn),
});
test("history includes all months across years and preserves zero months", () => {
  const rows = platformHistory([], [], "2026-02-20", 6);
  assert.deepEqual(
    rows.map((row) => row.key),
    ["2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02"],
  );
  assert.ok(rows.every((row) => row.clients === 0 && row.valueMMK === 0));
});
test("growth counts first starts once, carries earlier clients, excludes future and unrelated terms", () => {
  const rows = platformHistory(
    companies,
    [
      term("a", "2024-01-01"),
      term("a", "2026-01-01"),
      term("b", "2026-02-10"),
      term("b", "2026-02-25"),
      term("outside", "2026-01-01"),
    ],
    "2026-02-20",
    6,
  );
  assert.equal(rows[0].clients, 1);
  assert.equal(rows[4].clients, 1);
  assert.equal(rows[4].valueMMK, 25000);
  assert.equal(rows[5].clients, 2);
  assert.equal(rows[5].valueMMK, 25000);
});
test("future-only companies do not count as subscribed", () => {
  const rows = platformHistory(
    companies,
    [term("a", "2026-03-01")],
    "2026-02-20",
    12,
  );
  assert.equal(rows.length, 12);
  assert.ok(rows.every((row) => row.clients === 0 && row.valueMMK === 0));
});
