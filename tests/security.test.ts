import { setupDatabase } from "./database.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { SignJWT } from "jose";
import {
  many,
  one,
  emptyCompany,
  invoice,
  run,
  transaction,
} from "../src/lib/db.ts";
import { createSession, readSession } from "../src/lib/session.ts";
import { hashPassword, verifyPassword } from "../src/lib/password.ts";
await setupDatabase();
process.env.JWT_SECRET = "test-only-secret-with-at-least-thirty-two-characters";
for (const id of ["company-a", "company-b"]) {
  const c = emptyCompany(id, id);
  await run(
    "INSERT INTO companies(id,name,data) VALUES($1,$2,$3)",
    id,
    id,
    JSON.stringify(c),
  );
}
await run(
  "INSERT INTO users(id,companyId,name,email,password,role) VALUES('user-a','company-a','Test','test@example.com',$1,'STAFF')",
  hashPassword("a-secure-test-password"),
);
test("password hashes use unique salts and reject wrong passwords", () => {
  const a = hashPassword("correct-password");
  assert.notEqual(a, hashPassword("correct-password"));
  assert.equal(verifyPassword("correct-password", a), true);
  assert.equal(verifyPassword("wrong", a), false);
});
test("JWTs require a live session and current account version", async () => {
  const token = await createSession("user-a", 1);
  assert.equal((await readSession(token)).user?.id, "user-a");
  assert.equal((await readSession(token + "x")).user, null);
  await run("UPDATE users SET status='SUSPENDED',version=2 WHERE id='user-a'");
  assert.equal((await readSession(token)).reason, "suspended");
  await run("UPDATE users SET status='ACTIVE' WHERE id='user-a'");
  assert.equal((await readSession(token)).user, null);
  const renewed = await createSession("user-a", 2);
  await run("DELETE FROM sessions WHERE userId='user-a'");
  assert.equal((await readSession(renewed)).user, null);
});
test("expired and wrong-audience signed tokens are rejected", async () => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({ version: 2 })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("user-a")
    .setIssuer("brilliant")
    .setAudience("wrong")
    .setExpirationTime("1h")
    .sign(secret);
  assert.equal((await readSession(token)).user, null);
});
test("invoice lookups enforce company isolation", async () => {
  await run(
    "INSERT INTO invoices(id,companyId,number,data) VALUES('invoice-a','company-a','INV-2026-0001',$1)",
    JSON.stringify({ id: "invoice-a" }),
  );
  assert.equal(await invoice("invoice-a", "company-b"), undefined);
  assert.equal((await invoice("invoice-a", "company-a"))?.id, "invoice-a");
});
test("failed writes roll back sequential invoice counters", async () => {
  await assert.rejects(
    async () =>
      await transaction(async () => {
        await run(
          "INSERT INTO counters(companyId,year,value) VALUES('company-a','2026',1)",
        );
        throw new Error("rollback");
      }),
  );
  assert.equal((await many("SELECT * FROM counters")).length, 0);
});

test("concurrent transactions serialize counter allocation and isolate rollback", async () => {
  const allocate = () =>
    transaction(async () => {
      return (await one<{ value: number }>(
        "INSERT INTO counters(companyId,year,value) VALUES($1,$2,1) ON CONFLICT(companyId,year) DO UPDATE SET value=counters.value+1 RETURNING value",
        "company-a",
        "2027",
      ))!.value;
    });
  const values = await Promise.all(Array.from({ length: 12 }, allocate));
  assert.deepEqual(
    values.sort((a, b) => a - b),
    Array.from({ length: 12 }, (_, i) => i + 1),
  );
  await Promise.all([
    assert.rejects(
      transaction(async () => {
        await run(
          "UPDATE counters SET value=999 WHERE companyId=$1 AND year=$2",
          "company-a",
          "2027",
        );
        throw new Error("rollback concurrent write");
      }),
      /rollback concurrent write/,
    ),
    allocate(),
  ]);
  assert.equal(
    (
      await one<{ value: number }>(
        "SELECT value FROM counters WHERE companyId=$1 AND year=$2",
        "company-a",
        "2027",
      )
    )?.value,
    13,
  );
});

test("PostgreSQL keeps email uniqueness case insensitive and millisecond expiry intact", async () => {
  await assert.rejects(
    run(
      "INSERT INTO users(id,companyId,name,email,password,role) VALUES($1,$2,$3,$4,$5,$6)",
      "duplicate",
      "company-a",
      "Duplicate",
      "TEST@example.com",
      "unused",
      "STAFF",
    ),
    { code: "23505" },
  );
  await run(
    "INSERT INTO attempts(key,count,expires) VALUES($1,1,$2)",
    "expiry-test",
    Date.now() + 900000,
  );
  assert.ok(
    await one(
      "SELECT key FROM attempts WHERE key=$1 AND expires>$2",
      "expiry-test",
      Date.now(),
    ),
  );
});
