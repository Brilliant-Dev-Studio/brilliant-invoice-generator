import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promisify } from "node:util";
import test from "node:test";
import assert from "node:assert/strict";
import { setupDatabase } from "./database.ts";
import { emptyCompany, one, run } from "../src/lib/db.ts";
import { hashPassword, verifyPassword } from "../src/lib/password.ts";
import type { User } from "../src/lib/types.ts";

await setupDatabase();
const execute = promisify(execFile);
const email = "platform@example.com";
const password = "local-recovery-test-password";
type Account = User & { password: string };
const lookup = () => one<Account>("SELECT * FROM users WHERE email=$1", email);
const command = (mode: string) =>
  execute(
    process.execPath,
    ["--experimental-strip-types", "scripts/superadmin.ts", mode],
    {
      env: {
        ...process.env,
        BOOTSTRAP_EMAIL: email,
        BOOTSTRAP_PASSWORD: password,
      },
    },
  );

test("recovery creates an active platform account when missing", async () => {
  const { stdout } = await command("--recover");
  const user = await lookup();
  assert.equal(user?.role, "SUPERADMIN");
  assert.equal(user.status, "ACTIVE");
  assert.ok(verifyPassword(password, user.password));
  assert.ok(await one("SELECT id FROM companies WHERE id=$1", user.companyId));
  assert.match(stdout, /Superadmin access restored/);
  assert.ok(!stdout.includes(password));
});

test("recovery preserves tenants while resetting role, password, sessions and lockout", async () => {
  const original = (await lookup())!;
  const tenant = emptyCompany("tenant", "Existing tenant");
  await run(
    "INSERT INTO companies(id,name,data) VALUES($1,$2,$3)",
    tenant.id,
    tenant.name,
    JSON.stringify(tenant),
  );
  const otherPassword = hashPassword("unchanged-tenant-password");
  await run(
    "INSERT INTO users(id,companyId,name,email,password,role) VALUES($1,$2,$3,$4,$5,$6)",
    "tenant-user",
    tenant.id,
    "Tenant admin",
    "tenant@example.com",
    otherPassword,
    "COMPANY_ADMIN",
  );
  await run(
    "UPDATE users SET role='COMPANY_ADMIN',status='SUSPENDED',password=$1 WHERE id=$2",
    hashPassword("old-recovery-password"),
    original.id,
  );
  await run(
    "INSERT INTO sessions(id,userId,expires) VALUES($1,$2,$3)",
    "old-session",
    original.id,
    9999999999,
  );
  const key = createHash("sha256").update(email).digest("hex");
  await run(
    "INSERT INTO attempts(key,count,expires) VALUES($1,8,$2)",
    key,
    Date.now() + 900000,
  );

  await command("--recover");
  const user = (await lookup())!;
  assert.equal(user.id, original.id);
  assert.equal(user.companyId, original.companyId);
  assert.equal(user.role, "SUPERADMIN");
  assert.equal(user.status, "ACTIVE");
  assert.equal(user.version, original.version + 1);
  assert.ok(verifyPassword(password, user.password));
  assert.equal(
    await one("SELECT id FROM sessions WHERE userId=$1", user.id),
    undefined,
  );
  assert.equal(
    await one("SELECT key FROM attempts WHERE key=$1", key),
    undefined,
  );
  const other = await one<Account>(
    "SELECT * FROM users WHERE id='tenant-user'",
  );
  assert.equal(other?.role, "COMPANY_ADMIN");
  assert.equal(other.password, otherPassword);
  assert.equal(
    (
      await one<{ data: string }>(
        "SELECT data FROM companies WHERE id=$1",
        tenant.id,
      )
    )?.data,
    JSON.stringify(tenant),
  );
  assert.ok(
    await one(
      "SELECT id FROM audit WHERE targetId=$1 AND action=$2",
      user.id,
      "account.superadmin-recovered-locally",
    ),
  );
});

test("diagnostic check does not change an existing account", async () => {
  const before = await lookup();
  const { stdout } = await command("--check");
  assert.deepEqual(await lookup(), before);
  assert.match(stdout, /Role: SUPERADMIN; status: ACTIVE/);
  assert.match(stdout, /Password matches .env.local: yes/);
  assert.ok(!stdout.includes(password));
});
