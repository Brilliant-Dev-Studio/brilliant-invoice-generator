import test from "node:test";
import assert from "node:assert/strict";
import { assertTeamCapacity, TEAM_ACCOUNT_LIMIT } from "../src/lib/team.ts";

test("companies can create their first three staff accounts", () => {
  assert.equal(TEAM_ACCOUNT_LIMIT, 3);
  for (const count of [0, 1, 2])
    assert.doesNotThrow(() => assertTeamCapacity(count));
});
test("companies at or above the staff limit cannot add accounts", () => {
  for (const count of [3, 4, 10])
    assert.throws(() => assertTeamCapacity(count), /3 team accounts/);
});
