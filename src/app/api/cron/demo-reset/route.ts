import { authorizedCron } from "@/lib/cron-auth";
import { ensureDemo } from "@/lib/demo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!authorizedCron(request.headers.get("authorization")))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const reset = await ensureDemo(true);
    return Response.json(
      { reset },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Demo reset failed." }, { status: 500 });
  }
}
