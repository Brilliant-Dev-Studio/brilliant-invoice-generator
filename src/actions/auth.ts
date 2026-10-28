"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { audit, run } from "@/lib/db";
import { COOKIE, cookieOptions, readSession } from "@/lib/session";
import { authenticate } from "@/lib/authenticate";
import type { Result } from "@/lib/types";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-config";

export async function login(
  _previous: Result | null,
  form: FormData,
): Promise<Result> {
  const result = await authenticate(form);
  if (!result.ok) return result;
  (await cookies()).set(COOKIE, result.data.token, cookieOptions);
  redirect(
    result.data.user.role === "SUPERADMIN" ? "/superadmin" : "/dashboard",
  );
}
export async function logout() {
  const jar = await cookies();
  const session = await readSession(jar.get(COOKIE)?.value);
  if (session.sessionId)
    await run("DELETE FROM sessions WHERE id=$1", session.sessionId);
  if (session.user)
    await audit(session.user.id, "account.logout", session.user.id);
  jar.delete(COOKIE);
  redirect("/login");
}

export async function loginDemo(previous: Result | null): Promise<Result> {
  const form = new FormData();
  form.set("identifier", DEMO_EMAIL);
  form.set("password", DEMO_PASSWORD);
  return login(previous, form);
}
