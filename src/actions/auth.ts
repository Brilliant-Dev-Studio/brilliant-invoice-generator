"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "node:crypto";
import { audit, one, run, transaction } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/password";
import {
  COOKIE,
  cookieOptions,
  createSession,
  readSession,
} from "@/lib/session";
import type { Result, User } from "@/lib/types";
import { ensureDemo } from "@/lib/demo";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-config";
const dummyHash = hashPassword("unused-password-timing-padding");
export async function login(
  _previous: Result | null,
  form: FormData,
): Promise<Result> {
  const identifier = String(form.get("identifier") || "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") || "");
  if (!identifier || identifier.length > 250 || password.length > 128)
    return { ok: false, error: "Enter your email or phone and password." };
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
    return {
      ok: false,
      error:
        "The administrator needs to configure the session secret before login.",
    };
  const key = createHash("sha256").update(identifier).digest("hex");
  if (identifier === DEMO_EMAIL && password === DEMO_PASSWORD) {
    try {
      await ensureDemo();
    } catch {
      return {
        ok: false,
        error: "The demo is temporarily unavailable. Please try again shortly.",
      };
    }
  }
  const allowed = await transaction(async () => {
    await run("DELETE FROM attempts WHERE expires<$1", Date.now());
    const attempt = await one<{ count: number }>(
      "SELECT count FROM attempts WHERE key=$1",
      key,
    );
    if (attempt && attempt.count >= 8) return false;
    await run(
      "INSERT INTO attempts(key,count,expires) VALUES($1,1,$2) ON CONFLICT(key) DO UPDATE SET count=attempts.count+1",
      key,
      Date.now() + 15 * 60 * 1000,
    );
    return true;
  });
  if (!allowed)
    return {
      ok: false,
      error: "Too many attempts. Please try again in 15 minutes.",
    };
  const user = await one<User & { password: string }>(
    "SELECT * FROM users WHERE LOWER(email)=$1 OR phone=$2",
    identifier,
    identifier,
  );
  const correct = verifyPassword(password, user?.password || dummyHash);
  if (!user || !correct)
    return { ok: false, error: "Incorrect login details." };
  if (user.status === "SUSPENDED")
    return {
      ok: false,
      error: "This account is suspended. Contact your administrator.",
    };
  if (user.role !== "SUPERADMIN") {
    const workspace = await one<{ status: string }>(
      "SELECT status FROM companies WHERE id=$1",
      user.companyId,
    );
    if (!workspace || workspace.status === "SUSPENDED")
      return {
        ok: false,
        error: "This company is suspended. Contact the platform owner.",
      };
  }
  await run("DELETE FROM attempts WHERE key=$1", key);
  await audit(user.id, "account.login", user.id);
  (await cookies()).set(
    COOKIE,
    await createSession(user.id, user.version),
    cookieOptions,
  );
  redirect(user.role === "SUPERADMIN" ? "/superadmin" : "/dashboard");
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
