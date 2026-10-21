import test from "node:test";
import assert from "node:assert/strict";
import { setupDatabase } from "./database.ts";
import { ensureDemo } from "../src/lib/demo.ts";
import {
  DEMO_COMPANY_ID,
  DEMO_USER_ID,
  DEMO_RESET_INTERVAL,
  DEMO_PASSWORD,
} from "../src/lib/demo-config.ts";
import {
  company,
  clients,
  invoices,
  one,
  run,
  emptyCompany,
} from "../src/lib/db.ts";
import { createSession, readSession } from "../src/lib/session.ts";
import { verifyPassword } from "../src/lib/password.ts";

await setupDatabase();
process.env.JWT_SECRET = "test-only-demo-session-secret-at-least-32-characters";

test("demo provisioning, due reset, session identity and tenant isolation", async () => {
  const now = Date.now();
  assert.equal(await ensureDemo(false, now), true);
  const original = await invoices(DEMO_COMPANY_ID);
  assert.equal(original.length, 4);
  assert.equal((await clients(DEMO_COMPANY_ID)).length, 3);
  assert.equal((await company(DEMO_COMPANY_ID)).products?.length, 3);
  const user = await one<{ password: string }>(
    "SELECT password FROM users WHERE id=$1",
    DEMO_USER_ID,
  );
  assert.ok(user && verifyPassword(DEMO_PASSWORD, user.password));
  const session = await createSession(DEMO_USER_ID, 1);
  assert.equal((await readSession(session)).isDemo, true);
  assert.equal((await readSession(session)).user?.isDemo, true);

  const ordinary = emptyCompany("ordinary-workspace", "Keep my company");
  await run(
    "INSERT INTO companies(id,name,data) VALUES($1,$2,$3)",
    ordinary.id,
    ordinary.name,
    JSON.stringify(ordinary),
  );
  await run(
    "INSERT INTO clients(id,companyId,data) VALUES('ordinary-client',$1,'{}')",
    ordinary.id,
  );
  await run(
    "INSERT INTO invoices(id,companyId,number,data) VALUES('ordinary-invoice',$1,'INV-1','{}')",
    ordinary.id,
  );
  await run(
    "UPDATE companies SET data=$1 WHERE id=$2",
    JSON.stringify({
      ...(await company(DEMO_COMPANY_ID)),
      name: "Changed",
      products: [],
    }),
    DEMO_COMPANY_ID,
  );
  assert.equal(await ensureDemo(false, now + DEMO_RESET_INTERVAL - 1), false);
  assert.equal((await company(DEMO_COMPANY_ID)).name, "Changed");
  const results = await Promise.all([
    ensureDemo(false, now + DEMO_RESET_INTERVAL),
    ensureDemo(false, now + DEMO_RESET_INTERVAL),
  ]);
  assert.deepEqual(results.sort(), [false, true]);
  assert.equal((await invoices(DEMO_COMPANY_ID)).length, 4);
  assert.equal(
    (await company(DEMO_COMPANY_ID)).name,
    "San Pya Creative Studio",
  );
  assert.equal((await company(DEMO_COMPANY_ID)).products?.length, 3);
  assert.ok(
    !(await invoices(DEMO_COMPANY_ID)).some((i) => i.id === original[0].id),
  );
  assert.deepEqual(await company(ordinary.id), ordinary);
  assert.equal((await clients(ordinary.id)).length, 1);
  assert.equal((await invoices(ordinary.id)).length, 1);
  assert.equal((await readSession(session)).isDemo, true);
  assert.equal(await ensureDemo(true, now + DEMO_RESET_INTERVAL + 1), true);
});
