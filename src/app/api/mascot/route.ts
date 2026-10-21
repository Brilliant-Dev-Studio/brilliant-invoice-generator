import { cookies } from "next/headers";
import { COOKIE, readSession } from "@/lib/session";
import { one } from "@/lib/db";
import type { CompanionStats } from "@/lib/mascot-companion";

export async function GET() {
  const { user } = await readSession((await cookies()).get(COOKIE)?.value);
  const headers = { "Cache-Control": "no-store" };
  if (!user)
    return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  const stats = await one<CompanionStats>(
    `SELECT COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE data::jsonb->>'status' <> 'DRAFT')::int AS issued,
      COUNT(*) FILTER (WHERE data::jsonb->>'status' = 'PAID')::int AS paid,
      COUNT(*) FILTER (WHERE data::jsonb->>'status' = 'DRAFT')::int AS drafts
     FROM invoices WHERE companyId=$1`,
    user.companyId,
  );
  return Response.json(stats, { headers });
}
