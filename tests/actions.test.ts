import { setupDatabase } from "./database.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  company,
  emptyCompany,
  getUser,
  invoice,
  run,
  one,
} from "../src/lib/db.ts";
import { createSession } from "../src/lib/session.ts";
import type { InvoiceInput, Result } from "../src/lib/types.ts";
// Keep Next's request context at the test boundary; execute real actions and auth.
const jar = new Map<string, string>();
Object.assign(globalThis, { __testCookies: jar });
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "next/headers")
      return { url: "test:headers", shortCircuit: true };
    if (specifier === "next/navigation")
      return { url: "test:navigation", shortCircuit: true };
    if (specifier === "next/cache")
      return { url: "test:cache", shortCircuit: true };
    if (specifier.startsWith("@/")) {
      const file = resolve("src", specifier.slice(2));
      return { url: pathToFileURL(file + ".ts").href, shortCircuit: true };
    }
    if (
      specifier.startsWith(".") &&
      context.parentURL?.endsWith(".ts") &&
      !specifier.endsWith(".ts")
    ) {
      const file = new URL(specifier + ".ts", context.parentURL);
      if (existsSync(file)) return { url: file.href, shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url === "test:headers")
      return {
        format: "module",
        shortCircuit: true,
        source:
          "export async function cookies(){return {get:(key)=>{const value=globalThis.__testCookies.get(key);return value?{value}:undefined}}}",
      };
    if (url === "test:navigation")
      return {
        format: "module",
        shortCircuit: true,
        source:
          'export function redirect(path){throw new Error("REDIRECT:"+path)}',
      };
    if (url === "test:cache")
      return {
        format: "module",
        shortCircuit: true,
        source: "export function revalidatePath(){}",
      };
    return next(url, context);
  },
});
await setupDatabase();
process.env.JWT_SECRET =
  "integration-test-secret-never-used-in-the-application";
const a = randomUUID(),
  b = randomUUID(),
  admin = randomUUID(),
  staff = randomUUID(),
  other = randomUUID(),
  superadmin = randomUUID();
for (const id of [a, b]) {
  const c = emptyCompany(id, id);
  await run(
    "INSERT INTO companies(id,name,data) VALUES($1,$2,$3)",
    id,
    id,
    JSON.stringify(c),
  );
}
for (const [id, companyId, role] of [
  [admin, a, "COMPANY_ADMIN"],
  [staff, a, "STAFF"],
  [other, b, "STAFF"],
  [superadmin, a, "SUPERADMIN"],
])
  await run(
    "INSERT INTO users(id,companyId,name,email,password,role) VALUES($1,$2,$3,$4,$5,$6)",
    id,
    companyId,
    role,
    `${id}@example.com`,
    "not-used",
    role,
  );
const { saveInvoice, createClient, markPaid } =
  await import("../src/actions/invoices.ts");
const { setAccountStatus, createAccount, resetPassword } =
  await import("../src/actions/admin.ts");
async function as(id: string) {
  jar.set(
    "brilliant_session",
    await createSession(id, (await getUser(id))!.version),
  );
}
function success<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.data;
}
let clientId = "";
const requestId = randomUUID();
let input: InvoiceInput;
test("staff can create their own clients and invoices, but cannot mark them paid", async () => {
  await as(staff);
  clientId = success(
    await createClient({
      name: "Client A",
      email: "",
      phone: "",
      address: "Yangon",
    }),
  ).id;
  input = {
    clientId,
    title: "Website",
    currency: "USD",
    issueDate: "2026-10-20",
    dueDate: "2026-10-25",
    terms: "Net 5",
    items: [
      { id: randomUUID(), description: "Design", quantity: "2", price: "125" },
    ],
    discountType: "PERCENT",
    discount: "10",
    tax: "5",
    payment: "",
  };
  success(await saveInvoice(input, requestId, false));
  assert.equal((await invoice(requestId, a))?.totals.total, 23625);
  await assert.rejects(markPaid(requestId), /REDIRECT/);
});
test("cross-company client references and invoice IDs cannot mutate another tenant", async () => {
  await as(other);
  assert.equal((await saveInvoice(input, randomUUID(), true)).ok, false);
  const client = success(
    await createClient({ name: "Client B", email: "", phone: "", address: "" }),
  );
  const attack = await saveInvoice(
    { ...input, clientId: client.id, title: "Overwritten" },
    requestId,
    true,
  );
  assert.equal(attack.ok, false);
  assert.equal((await invoice(requestId, a))?.title, "Website");
});
test("stale draft revisions fail, and issued invoice snapshots survive profile changes", async () => {
  await as(staff);
  assert.equal((await saveInvoice(input, requestId, false, 0)).ok, false);
  success(await saveInvoice(input, requestId, true, 1));
  const original = (await invoice(requestId, a))!.company.name;
  const changed = await company(a);
  changed.name = "Changed name";
  await run(
    "UPDATE companies SET data=$1 WHERE id=$2",
    JSON.stringify(changed),
    a,
  );
  assert.equal((await invoice(requestId, a))?.company.name, original);
  assert.equal(
    (await saveInvoice({ ...input, title: "Edited" }, requestId, false, 2)).ok,
    false,
  );
});
test("company admin records payment once and cannot create accounts", async () => {
  await as(admin);
  success(await markPaid(requestId));
  const paidAt = (await invoice(requestId, a))?.paidAt;
  success(await markPaid(requestId));
  assert.equal((await invoice(requestId, a))?.paidAt, paidAt);
  await assert.rejects(createAccount(new FormData()), /REDIRECT/);
  await assert.rejects(
    resetPassword(staff, "a-very-good-password"),
    /REDIRECT/,
  );
});
test("company admin can suspend staff only in their own company", async () => {
  await as(admin);
  assert.equal((await setAccountStatus(other, "SUSPENDED")).ok, false);
  success(await setAccountStatus(staff, "SUSPENDED"));
  assert.equal((await getUser(staff))?.status, "SUSPENDED");
  assert.equal(
    (
      await one<{ count: number }>(
        "SELECT COUNT(*)::int count FROM sessions WHERE userId=$1",
        staff,
      )
    )?.count,
    0,
  );
});
test("suspended users and anonymous callers cannot invoke invoice mutations", async () => {
  await as(staff);
  await assert.rejects(
    createClient({ name: "Blocked" }),
    /REDIRECT:\/login\?error=suspended/,
  );
  jar.clear();
  await assert.rejects(
    saveInvoice(input, randomUUID(), true),
    /REDIRECT:\/login/,
  );
});

test("concurrent saves of the same draft allow only one revision", async () => {
  await as(admin);
  const id = randomUUID();
  success(await saveInvoice(input, id, false));
  const results = await Promise.all([
    saveInvoice({ ...input, title: "First edit" }, id, false, 1),
    saveInvoice({ ...input, title: "Second edit" }, id, false, 1),
  ]);
  assert.equal(results.filter((result) => result.ok).length, 1);
  assert.equal((await invoice(id, a))?.revision, 2);
});

function accountForm(email: string, companyId = "new") {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    name: "Plan client",
    email,
    phone: "",
    role: "COMPANY_ADMIN",
    companyId,
    companyName: "Subscription test",
    password: "Strong-test-password-123!",
    planId: "QUARTERLY",
    startsOn: "2026-01-01",
    priceMMK: "1",
  }))
    form.set(key, value);
  return form;
}
test("new client plans are required and saved with server prices; staff inherit coverage", async () => {
  await as(superadmin);
  const email = `${randomUUID()}@example.com`;
  const form = accountForm(email);
  form.delete("planId");
  assert.equal((await createAccount(form)).ok, false);
  form.set("planId", "QUARTERLY");
  success(await createAccount(form));
  const user = (await one<{ companyId: string }>(
    "SELECT companyId FROM users WHERE email=$1",
    email,
  ))!;
  const plan = (await one<{ priceMMK: number; expiresOn: string }>(
    "SELECT priceMMK,expiresOn FROM company_subscriptions WHERE companyId=$1",
    user.companyId,
  ))!;
  assert.equal(plan.priceMMK, 75000);
  assert.equal(plan.expiresOn, "2026-04-04");
  const staffForm = accountForm(`${randomUUID()}@example.com`, user.companyId);
  staffForm.set("role", "STAFF");
  success(await createAccount(staffForm));
  assert.equal(
    (
      await one<{ count: number }>(
        "SELECT COUNT(*)::int count FROM company_subscriptions WHERE companyId=$1",
        user.companyId,
      )
    )?.count,
    1,
  );
  const count = (await one<{ count: number }>(
    "SELECT COUNT(*)::int count FROM companies",
  ))!.count;
  assert.equal((await createAccount(form)).ok, false);
  assert.equal(
    (await one<{ count: number }>("SELECT COUNT(*)::int count FROM companies"))!
      .count,
    count,
  );
});
test("renewals require owner access and serialize concurrent overlapping terms", async () => {
  const { assignCompanyPlan } = await import("../src/actions/admin.ts");
  const form = new FormData();
  form.set("companyId", b);
  form.set("planId", "MONTHLY");
  form.set("startsOn", "2026-01-01");
  await as(admin);
  await assert.rejects(assignCompanyPlan(form), /REDIRECT/);
  await as(superadmin);
  const results = await Promise.all([
    assignCompanyPlan(form),
    assignCompanyPlan(form),
  ]);
  assert.equal(results.filter((result) => result.ok).length, 1);
  form.set("startsOn", "2026-01-31");
  assert.equal((await assignCompanyPlan(form)).ok, false);
  form.set("startsOn", "2026-02-01");
  success(await assignCompanyPlan(form));
});

test("platform company controls enforce owner access and suspension without changing individual status", async () => {
  const { updatePlatformCompany, setCompanyStatus } =
    await import("../src/actions/platform.ts");
  const { readSession } = await import("../src/lib/session.ts");
  await as(admin);
  await assert.rejects(setCompanyStatus(b, "SUSPENDED"), /REDIRECT/);
  await assert.rejects(updatePlatformCompany(new FormData()), /REDIRECT/);
  await as(superadmin);
  assert.equal((await setCompanyStatus(a, "SUSPENDED")).ok, false);
  const existingToken = await createSession(
    other,
    (await getUser(other))!.version,
  );
  success(await setCompanyStatus(b, "SUSPENDED"));
  assert.equal((await readSession(existingToken)).user, null);
  const blockedToken = await createSession(
    other,
    (await getUser(other))!.version,
  );
  assert.equal((await readSession(blockedToken)).reason, "suspended");
  assert.equal((await getUser(other))!.status, "ACTIVE");
  success(await setCompanyStatus(b, "ACTIVE"));
  assert.equal((await readSession(existingToken)).user, null);
  const newToken = await createSession(other, (await getUser(other))!.version);
  assert.equal((await readSession(newToken)).user?.id, other);
  const profile = new FormData();
  for (const [key, value] of Object.entries({
    id: b,
    name: "Updated platform client",
    email: "contact@example.com",
    phone: "",
    address: "Yangon",
    taxId: "TAX-123",
  }))
    profile.set(key, value);
  success(await updatePlatformCompany(profile));
  assert.equal((await company(b)).name, "Updated platform client");
  assert.equal((await company(b)).taxId, "TAX-123");
  assert.ok(
    await one(
      "SELECT id FROM audit WHERE actorId=$1 AND action='platform.company.updated' AND targetId=$2",
      superadmin,
      b,
    ),
  );
});
