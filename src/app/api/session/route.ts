import { cookies } from "next/headers";
import { COOKIE, readSession } from "@/lib/session";
export async function GET() {
  const session = await readSession((await cookies()).get(COOKIE)?.value);
  return Response.json(
    session.user ? { active: true } : { error: session.reason },
    {
      status: session.user ? 200 : 401,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
