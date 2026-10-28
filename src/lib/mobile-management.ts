import { z } from "zod";
import { clients, company, invoices, many, one, userColumns } from "@/lib/db";
import type { User } from "./types";
import {
  createAccount,
  setAccountStatus,
  resetPassword,
  assignCompanyPlan,
} from "@/actions/admin";
import { updatePlatformCompany, setCompanyStatus } from "@/actions/platform";
import {
  saveCompany,
  saveInvoiceAppearance,
  uploadAsset,
} from "@/actions/settings";
import {
  saveFinancialOverview,
  resetFinancialOverview,
} from "@/actions/financial-overview";
import { GET as readAsset } from "@/app/api/assets/[id]/route";
import { storageReady } from "@/lib/storage";

const reply = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
const ok = (data: unknown) => reply({ ok: true, data });
const form = (data: unknown) => {
  const values = z.record(z.string(), z.string().max(1000)).parse(data);
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) result.set(key, value);
  return result;
};
const subscriptionColumns =
  "id,companyId,planId,startsOn,expiresOn,priceMMK,months,bonusDays,bonusMonths";

// Called only inside the bearer-authenticated mobile context. Actions retain web authorization and validation.
export async function mobileManagement(
  request: Request,
  path: string[],
  user: User,
): Promise<Response | null> {
  const resource = path.join("/");
  if (request.method === "GET" && path[0] === "assets" && path.length === 2)
    return readAsset(request, {
      params: Promise.resolve({ id: z.uuid().parse(path[1]) }),
    });
  if (!["management", "settings", "platform"].includes(path[0])) return null;
  if (
    user.role === "STAFF" ||
    (path[0] === "platform" && user.role !== "SUPERADMIN")
  )
    return reply(
      { ok: false, error: "You do not have permission for this action." },
      403,
    );
  if (request.method === "GET" && resource === "management") {
    const owner = user.role === "SUPERADMIN";
    return ok({
      users: await many(
        `SELECT ${userColumns} FROM users ${owner ? "" : "WHERE companyId=$1 AND role='STAFF'"} ORDER BY name`,
        ...(owner ? [] : [user.companyId]),
      ),
      companies: owner
        ? await many("SELECT id,name,status FROM companies ORDER BY name")
        : [await company(user.companyId)],
      subscriptions: await many(
        `SELECT ${subscriptionColumns} FROM company_subscriptions ${owner ? "" : "WHERE companyId=$1"} ORDER BY startsOn`,
        ...(owner ? [] : [user.companyId]),
      ),
      platformClients: owner
        ? await many(
            "SELECT c.id,c.name,c.status,(SELECT COUNT(*)::int FROM users u WHERE u.companyId=c.id AND u.role<>'SUPERADMIN') AS accountCount FROM companies c WHERE EXISTS(SELECT 1 FROM users u WHERE u.companyId=c.id AND u.role<>'SUPERADMIN') OR EXISTS(SELECT 1 FROM company_subscriptions s WHERE s.companyId=c.id) ORDER BY c.name",
          )
        : [],
      storageReady: storageReady(),
    });
  }
  if (
    request.method === "GET" &&
    path[0] === "platform" &&
    path[1] === "companies" &&
    path.length === 3
  ) {
    const id = z.string().min(1).max(100).parse(path[2]);
    const row = await one("SELECT status FROM companies WHERE id=$1", id);
    if (!row) return reply({ ok: false, error: "Company not found." }, 404);
    return ok({
      company: await company(id),
      ...row,
      clients: await clients(id),
      invoices: await invoices(id),
    });
  }
  if (request.method === "GET" && resource === "platform/activity") {
    const params = new URL(request.url).searchParams;
    const q = (params.get("q") || "").trim().slice(0, 250);
    const before = z
      .string()
      .regex(/^\d{1,18}$/)
      .parse(params.get("before") || "9223372036854775807");
    const events = await many<{ id: string }>(
      `SELECT a.id::text,u.name AS actor,c.name AS company,a.action,a.targetId,a.createdAt FROM audit a LEFT JOIN users u ON u.id=a.actorId LEFT JOIN companies c ON c.id=u.companyId WHERE a.id<$1::bigint AND ($2='' OR strpos(lower(concat_ws(' ',u.name,c.name,a.action,a.targetId)),lower($2))>0) ORDER BY a.id DESC LIMIT 51`,
      before,
      q,
    );
    return ok({
      events: events.slice(0, 50),
      next: events.length > 50 ? events[49].id : null,
    });
  }
  if (request.method !== "POST") return null;
  // Bound JSON uploads below Vercel's request limit; decoded images are validated again by uploadAsset.
  const raw = await request.text();
  if (raw.length > 4_000_000)
    return reply({ ok: false, error: "Choose an image under 2.8 MB." }, 413);
  const data: unknown = JSON.parse(raw);
  let result;
  switch (resource) {
    case "settings/company":
      result = await saveCompany(data);
      break;
    case "settings/appearance":
      result = await saveInvoiceAppearance(data);
      break;
    case "settings/financial":
      result = await saveFinancialOverview(data);
      break;
    case "settings/financial/reset":
      result = await resetFinancialOverview();
      break;
    case "settings/upload": {
      const input = z
        .object({
          purpose: z.enum(["logo", "signature", "kpay", "wavepay", "bank"]),
          base64: z
            .string()
            .min(4)
            .max(3_800_000)
            .regex(/^[A-Za-z0-9+/]*={0,2}$/),
        })
        .parse(data);
      const payload = new FormData();
      payload.set("purpose", input.purpose);
      payload.set(
        "file",
        new File([Buffer.from(input.base64, "base64")], "upload.png"),
      );
      result = await uploadAsset(payload);
      break;
    }
    case "management/accounts":
      result = await createAccount(form(data));
      break;
    case "management/status": {
      const input = z
        .object({
          id: z.string().min(1),
          status: z.enum(["ACTIVE", "SUSPENDED"]),
        })
        .parse(data);
      result = await setAccountStatus(input.id, input.status);
      break;
    }
    case "platform/password": {
      const input = z
        .object({
          id: z.string().min(1),
          password: z.string().min(12).max(128),
        })
        .parse(data);
      result = await resetPassword(input.id, input.password);
      break;
    }
    case "platform/plan":
      result = await assignCompanyPlan(form(data));
      break;
    case "platform/company":
      result = await updatePlatformCompany(form(data));
      break;
    case "platform/status": {
      const input = z
        .object({
          id: z.string().min(1),
          status: z.enum(["ACTIVE", "SUSPENDED"]),
        })
        .parse(data);
      result = await setCompanyStatus(input.id, input.status);
      break;
    }
    default:
      return null;
  }
  return reply(result, result.ok ? 200 : 400);
}
