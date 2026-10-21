import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "node:crypto";
import { getUser, one, run } from "./db.ts";
import { isDemoCompany } from "./demo-config.ts";
export const COOKIE = "brilliant_session";
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8,
};
function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32)
    throw new Error("Configure JWT_SECRET with at least 32 characters.");
  return new TextEncoder().encode(value);
}
export async function createSession(userId: string, version: number) {
  const id = randomUUID();
  const expires = Math.floor(Date.now() / 1000) + cookieOptions.maxAge;
  const token = await new SignJWT({ version })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setJti(id)
    .setIssuer("brilliant")
    .setAudience("brilliant-app")
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(secret());
  await run(
    "DELETE FROM sessions WHERE expires < $1",
    Math.floor(Date.now() / 1000),
  );
  await run(
    "INSERT INTO sessions(id,userId,expires) VALUES($1,$2,$3)",
    id,
    userId,
    expires,
  );
  return token;
}
export async function readSession(token?: string) {
  if (!token) return { user: null, reason: "unauthorized" as const };
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: ["HS256"],
      issuer: "brilliant",
      audience: "brilliant-app",
    });
    const user = await getUser(payload.sub || "");
    if (user?.status === "SUSPENDED")
      return { user: null, reason: "suspended" as const };
    if (user && user.role !== "SUPERADMIN") {
      const workspace = await one<{ status: string }>(
        "SELECT status FROM companies WHERE id=$1",
        user.companyId,
      );
      if (!workspace || workspace.status === "SUSPENDED")
        return { user: null, reason: "suspended" as const };
    }
    const session = await one<{ id: string }>(
      "SELECT id FROM sessions WHERE id=$1 AND userId=$2 AND expires>$3",
      payload.jti || "",
      payload.sub || "",
      Math.floor(Date.now() / 1000),
    );
    if (!user || !session || user.version !== payload.version)
      return { user: null, reason: "unauthorized" as const };
    const isDemo = isDemoCompany(user.companyId);
    return {
      user: { ...user, isDemo },
      isDemo,
      sessionId: session.id,
      reason: null,
    };
  } catch {
    return { user: null, reason: "unauthorized" as const };
  }
}
