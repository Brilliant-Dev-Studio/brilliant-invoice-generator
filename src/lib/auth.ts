import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, readSession } from "./session";
import type { Role } from "./types";
import { mobileContext } from "./mobile-context";
export async function requireUser(roles?: Role[]) {
  const mobile = mobileContext.getStore();
  if (mobile) {
    if (roles && !roles.includes(mobile.user.role))
      throw new Error("You do not have permission for this action.");
    return mobile.user;
  }
  const result = await readSession((await cookies()).get(COOKIE)?.value);
  if (!result.user)
    redirect(
      `/login${result.reason === "suspended" ? "?error=suspended" : ""}`,
    );
  if (roles && !roles.includes(result.user.role))
    redirect("/dashboard?error=forbidden");
  return result.user;
}
