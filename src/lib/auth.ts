import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, readSession } from "./session";
import type { Role } from "./types";
export async function requireUser(roles?: Role[]) {
  const result = await readSession((await cookies()).get(COOKIE)?.value);
  if (!result.user)
    redirect(
      `/login${result.reason === "suspended" ? "?error=suspended" : ""}`,
    );
  if (roles && !roles.includes(result.user.role))
    redirect("/dashboard?error=forbidden");
  return result.user;
}
