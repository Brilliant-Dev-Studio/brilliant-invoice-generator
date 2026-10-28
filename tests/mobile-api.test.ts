import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { mobileContext } from "../src/lib/mobile-context.ts";
import type { User } from "../src/lib/types.ts";

const staff: User = {
  id: "staff",
  companyId: "company-a",
  name: "Staff",
  email: "staff@example.com",
  phone: null,
  role: "STAFF",
  status: "ACTIVE",
  version: 1,
};
const admin: User = { ...staff, id: "admin", role: "COMPANY_ADMIN" };
const other: User = { ...staff, id: "other", companyId: "company-b" };
const owner: User = { ...staff, id: "owner", role: "SUPERADMIN" };
const users = new Map([
  ["staff", staff],
  ["admin", admin],
  ["other", other],
  ["owner", owner],
]);
let saved: unknown;
let payments = 0;
const queries: { sql: string; args: unknown[] }[] = [];
let managementCall:
  { name: string; input: unknown; companyId?: string } | undefined;
const action = (name: string) => async (input?: unknown) => {
  managementCall = {
    name,
    input,
    companyId: mobileContext.getStore()?.user.companyId,
  };
  return { ok: true, data: "saved" };
};
const mock = {
  async readSession(token?: string) {
    return { user: users.get(token || "") || null, sessionId: token };
  },
  async authenticate() {
    return { ok: true, data: { user: staff, token: "staff" } };
  },
  async company(id: string) {
    await new Promise((resolve) => setImmediate(resolve));
    return { id };
  },
  async clients(id: string) {
    return [{ companyId: id }];
  },
  async invoices(id: string) {
    return [{ companyId: id, currency: "MMK", status: "DRAFT" }];
  },
  async run(_sql: string, id: string) {
    users.delete(id);
  },
  async audit() {},
  async many(sql: string, ...args: unknown[]) {
    queries.push({ sql, args });
    return [];
  },
  async one() {
    return { status: "ACTIVE" };
  },
  userColumns: "id,companyId,name,email,phone,role,status,version",
  storageReady: () => true,
  createAccount: action("createAccount"),
  setAccountStatus: action("setAccountStatus"),
  resetPassword: action("resetPassword"),
  assignCompanyPlan: action("assignCompanyPlan"),
  updatePlatformCompany: action("updatePlatformCompany"),
  setCompanyStatus: action("setCompanyStatus"),
  saveCompany: action("saveCompany"),
  saveInvoiceAppearance: action("saveInvoiceAppearance"),
  uploadAsset: action("uploadAsset"),
  saveFinancialOverview: action("saveFinancialOverview"),
  resetFinancialOverview: action("resetFinancialOverview"),
  async createClient() {
    await new Promise((resolve) => setImmediate(resolve));
    return {
      ok: true,
      data: { companyId: mobileContext.getStore()?.user.companyId },
    };
  },
  async saveInvoice(...args: unknown[]) {
    saved = args;
    return { ok: true, data: { id: args[1] } };
  },
  async markPaid() {
    payments++;
    return { ok: true };
  },
};
Object.assign(globalThis, { __mobileMocks: mock });
const modules: Record<string, string[]> = {
  "@/lib/session": ["readSession"],
  "@/lib/authenticate": ["authenticate"],
  "@/lib/db": [
    "company",
    "clients",
    "invoices",
    "run",
    "audit",
    "many",
    "one",
    "userColumns",
  ],
  "@/lib/storage": ["storageReady"],
  "@/actions/admin": [
    "createAccount",
    "setAccountStatus",
    "resetPassword",
    "assignCompanyPlan",
  ],
  "@/actions/platform": ["updatePlatformCompany", "setCompanyStatus"],
  "@/actions/settings": ["saveCompany", "saveInvoiceAppearance", "uploadAsset"],
  "@/actions/financial-overview": [
    "saveFinancialOverview",
    "resetFinancialOverview",
  ],
  "@/actions/invoices": ["createClient", "saveInvoice", "markPaid"],
};
registerHooks({
  resolve(specifier, context, next) {
    if (modules[specifier])
      return { url: `mobile-test:${specifier}`, shortCircuit: true };
    if (
      specifier === "@/app/api/invoices/[id]/pdf/route" ||
      specifier === "@/app/api/invoices/[id]/png/route" ||
      specifier === "@/app/api/assets/[id]/route"
    )
      return { url: "mobile-test:pdf", shortCircuit: true };
    if (specifier.startsWith("@/"))
      return {
        url: new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href,
        shortCircuit: true,
      };
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url === "mobile-test:pdf")
      return {
        format: "module",
        shortCircuit: true,
        source: 'export const GET = async () => new Response("PDF");',
      };
    if (url.startsWith("mobile-test:"))
      return {
        format: "module",
        shortCircuit: true,
        source: modules[url.slice(12)]
          .map(
            (name) =>
              `export const ${name} = globalThis.__mobileMocks.${name};`,
          )
          .join("\n"),
      };
    return next(url, context);
  },
});
const { GET, POST } = await import("../src/app/api/mobile/[...path]/route.ts");
async function request(
  path: string,
  token?: string,
  body?: unknown,
  cookie?: string,
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (cookie) headers.set("Cookie", cookie);
  return (body === undefined ? GET : POST)(
    new Request(`https://example.com/api/mobile/${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    { params: Promise.resolve({ path: path.split("/") }) },
  );
}
test("mobile rejects missing, invalid and cookie-only authentication", async () => {
  for (const token of [undefined, "bad"])
    assert.equal((await request("workspace", token)).status, 401);
  assert.equal(
    (
      await request(
        "clients",
        undefined,
        { name: "Bad" },
        "brilliant_session=staff",
      )
    ).status,
    401,
  );
});
test("workspace data stays scoped to bearer user across concurrent requests", async () => {
  const results = await Promise.all(
    ["staff", "other"].map(async (token) =>
      (await request("workspace", token)).json(),
    ),
  );
  assert.equal(results[0].data.company.id, "company-a");
  assert.equal(results[1].data.company.id, "company-b");
  assert.equal(results[1].data.clients[0].companyId, "company-b");
  assert.equal(results[0].data.invoices[0].companyId, "company-a");
});
test("action context cannot leak between concurrent companies", async () => {
  const results = await Promise.all(
    ["staff", "other"].map(async (token) =>
      (await request("clients", token, {})).json(),
    ),
  );
  assert.deepEqual(
    results.map((result) => result.data.companyId),
    ["company-a", "company-b"],
  );
  assert.equal(mobileContext.getStore(), undefined);
});
test("staff cannot mark paid; company admins can", async () => {
  const path = "invoices/10000000-0000-4000-8000-000000000001/paid";
  assert.equal((await request(path, "staff", {})).status, 403);
  assert.equal(payments, 0);
  assert.equal((await request(path, "admin", {})).status, 200);
  assert.equal(payments, 1);
});
test("invoice writes require valid ids, booleans and positive revisions", async () => {
  assert.equal(
    (await request("invoices", "staff", { requestId: "bad", issue: "false" }))
      .status,
    400,
  );
  const payload = {
    input: { title: "Invoice" },
    requestId: "10000000-0000-4000-8000-000000000001",
    issue: false,
    revision: 3,
  };
  assert.equal((await request("invoices", "staff", payload)).status, 200);
  assert.deepEqual(saved, [payload.input, payload.requestId, false, 3]);
});
test("platform owners enter their own workspace without impersonating a tenant", async () => {
  const response = await request("workspace", "owner");
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.company.id, owner.companyId);
});
test("login works without bearer and never caches credentials", async () => {
  const response = await request("login", undefined, {
    identifier: "staff@example.com",
    password: "example",
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.equal((await response.json()).data.token, "staff");
});
test("logout revokes the bearer session", async () => {
  assert.equal((await request("logout", "other", {})).status, 200);
  assert.equal((await request("workspace", "other")).status, 401);
});

test("staff cannot read management or mutate privileged resources", async () => {
  for (const path of [
    "management",
    "platform/activity",
    "platform/companies/other",
  ])
    assert.equal((await request(path, "staff")).status, 403);
  for (const path of [
    "settings/company",
    "settings/upload",
    "settings/financial",
    "management/accounts",
    "management/status",
    "platform/password",
    "platform/plan",
  ])
    assert.equal((await request(path, "staff", {})).status, 403);
});
test("company admins cannot access platform operations", async () => {
  for (const path of ["platform/activity", "platform/companies/other"])
    assert.equal((await request(path, "admin")).status, 403);
  for (const path of [
    "platform/password",
    "platform/plan",
    "platform/company",
    "platform/status",
  ])
    assert.equal((await request(path, "admin", {})).status, 403);
});
test("management reads scope staff and subscriptions to company admin", async () => {
  queries.length = 0;
  assert.equal((await request("management", "admin")).status, 200);
  assert.equal(queries.length, 2);
  for (const query of queries) {
    assert.match(query.sql, /WHERE companyId=\$1/);
    assert.deepEqual(query.args, [admin.companyId]);
  }
  assert.doesNotMatch(queries[0].sql, /password/i);
});
test("settings reuse the authenticated company context and web action", async () => {
  assert.equal(
    (await request("settings/company", "admin", { name: "Updated" })).status,
    200,
  );
  assert.equal(managementCall?.name, "saveCompany");
  assert.equal(managementCall?.companyId, admin.companyId);
});
test("account creation passes FormData to existing role-enforcing action", async () => {
  assert.equal(
    (await request("management/accounts", "admin", { role: "SUPERADMIN" }))
      .status,
    200,
  );
  assert.equal(managementCall?.name, "createAccount");
  assert.ok(managementCall?.input instanceof FormData);
});
test("platform owners can delegate plan assignment", async () => {
  assert.equal(
    (
      await request("platform/plan", "owner", {
        companyId: "tenant",
        planId: "MONTHLY",
        startsOn: "2026-10-25",
      })
    ).status,
    200,
  );
  assert.equal(managementCall?.name, "assignCompanyPlan");
});
test("uploads reject oversized and malformed base64", async () => {
  assert.equal(
    (
      await request("settings/upload", "admin", {
        purpose: "logo",
        base64: "%%%%",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("settings/upload", "admin", {
        purpose: "logo",
        base64: "a".repeat(4_000_001),
      })
    ).status,
    413,
  );
});

test("overview uses Yangon monthly revenue and the same manual overrides as web", async () => {
  const { mobileOverview } = await import("../src/lib/mobile-overview.ts");
  const invoice = (
    currency: string,
    status: string,
    total: number,
    paidAt: string | null,
  ) => ({ currency, status, totals: { total }, paidAt, dueDate: "2026-12-01" });
  const documents = [
    invoice("MMK", "PAID", 1000, "2026-09-30T18:00:00Z"),
    invoice("MMK", "PAID", 5000, "2026-09-01T00:00:00Z"),
    invoice("MMK", "UNPAID", 2000, null),
    invoice("USD", "PAID", 999, "2026-10-01T00:00:00Z"),
  ];
  const result = mobileOverview(
    {
      financialOverview: {
        currencies: { MMK: { month: "2026-09", revenue: 99, outstanding: 0 } },
        count: 0,
      },
    } as never,
    documents as never,
    "2026-10-25",
  );
  assert.equal(result.MMK.revenue, 1000);
  assert.equal(result.MMK.outstanding, 0);
  assert.equal(result.MMK.count, 0);
  assert.equal(result.MMK.manualRevenue, false);
  assert.equal(result.MMK.manualOutstanding, true);
  assert.equal(result.USD.revenue, 999);
  const current = mobileOverview(
    {
      financialOverview: {
        currencies: { MMK: { month: "2026-10", revenue: 0 } },
      },
    } as never,
    documents as never,
    "2026-10-25",
  );
  assert.equal(current.MMK.revenue, 0);
  assert.equal(current.MMK.manualRevenue, true);
  assert.equal(current.MMK.outstanding, 2000);
});
