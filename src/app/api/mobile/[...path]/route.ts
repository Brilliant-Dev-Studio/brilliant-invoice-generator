import { authenticate } from "@/lib/authenticate";
import { mobileContext } from "@/lib/mobile-context";
import { readSession } from "@/lib/session";
import { audit, clients, company, invoices, run } from "@/lib/db";
import { createClient, markPaid, saveInvoice } from "@/actions/invoices";
import { GET as exportPdf } from "@/app/api/invoices/[id]/pdf/route";
import { GET as exportPng } from "@/app/api/invoices/[id]/png/route";
import { today } from "@/lib/money";
import { z } from "zod";
import { mobileManagement } from "@/lib/mobile-management";
import { mobileOverview } from "@/lib/mobile-overview";

export const runtime = "nodejs";
export const maxDuration = 60;
const reply = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
const failure = (error: string, status: number) =>
  reply({ ok: false, error }, status);
const saveSchema = z.object({
  input: z.unknown(),
  requestId: z.uuid(),
  issue: z.boolean(),
  revision: z.number().int().positive().optional(),
});
async function handle(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const resource = path.join("/");
  try {
    if (request.method === "POST" && resource === "login") {
      const data = z
        .object({
          identifier: z.string().max(250),
          password: z.string().max(128),
        })
        .parse(await request.json());
      const form = new FormData();
      form.set("identifier", data.identifier);
      form.set("password", data.password);
      const result = await authenticate(form);
      if (!result.ok) return reply(result, 401);
      return reply(result);
    }
    // Cookies are deliberately not accepted: mutations require an explicit token.
    const token = request.headers
      .get("authorization")
      ?.match(/^Bearer ([^\s]+)$/i)?.[1];
    const session = await readSession(token);
    if (!session.user || !token)
      return failure("Your session ended. Please sign in again.", 401);
    return await mobileContext.run({ user: session.user, token }, async () => {
      const user = session.user!;
      const management = await mobileManagement(request, path, user);
      if (management) return management;
      if (request.method === "GET" && resource === "workspace") {
        const [brand, customers, documents] = await Promise.all([
          company(user.companyId),
          clients(user.companyId),
          invoices(user.companyId),
        ]);
        return reply({
          ok: true,
          data: {
            user,
            company: brand,
            clients: customers,
            invoices: documents,
            today: today(),
            overview: mobileOverview(brand, documents, today()),
          },
        });
      }
      if (request.method === "GET" && resource === "session")
        return reply({ ok: true, data: user });
      if (
        request.method === "GET" &&
        path.length === 3 &&
        path[0] === "invoices" &&
        path[2] === "pdf"
      ) {
        const id = z.uuid().parse(path[1]);
        return exportPdf(request, { params: Promise.resolve({ id }) });
      }
      if (
        request.method === "GET" &&
        path.length === 3 &&
        path[0] === "invoices" &&
        path[2] === "png"
      ) {
        const id = z.uuid().parse(path[1]);
        return exportPng(request, { params: Promise.resolve({ id }) });
      }
      if (request.method === "POST" && resource === "logout") {
        await run("DELETE FROM sessions WHERE id=$1", session.sessionId!);
        await audit(user.id, "account.logout", user.id);
        return reply({ ok: true });
      }
      if (request.method === "POST" && resource === "clients") {
        const result = await createClient(await request.json());
        return reply(result, result.ok ? 201 : 400);
      }
      if (request.method === "POST" && resource === "invoices") {
        const data = saveSchema.parse(await request.json());
        const result = await saveInvoice(
          data.input,
          data.requestId,
          data.issue,
          data.revision,
        );
        return reply(result, result.ok ? 200 : 409);
      }
      if (
        request.method === "POST" &&
        path.length === 3 &&
        path[0] === "invoices" &&
        path[2] === "paid"
      ) {
        if (user.role === "STAFF")
          return failure(
            "Only company administrators can record payments.",
            403,
          );
        const result = await markPaid(z.uuid().parse(path[1]));
        return reply(result, result.ok ? 200 : 400);
      }
      return failure("Endpoint not found.", 404);
    });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError)
      return failure("Invalid request. Check the submitted fields.", 400);
    console.error(
      "Mobile API request failed",
      error instanceof Error ? error.name : "Unknown",
    );
    return failure("The service is unavailable. Please try again.", 503);
  }
}
export const GET = handle;
export const POST = handle;
