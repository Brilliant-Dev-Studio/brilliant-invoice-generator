import { NextRequest, NextResponse } from "next/server";
import { COOKIE, readSession } from "@/lib/session";
export async function proxy(request: NextRequest) {
  // Mobile routes authenticate bearer sessions themselves, including public login.
  if (request.nextUrl.pathname.startsWith("/api/mobile/"))
    return NextResponse.next();
  const { user, reason } = await readSession(
    request.cookies.get(COOKIE)?.value,
  );
  if (!user) {
    const response = request.nextUrl.pathname.startsWith("/api/")
      ? NextResponse.json({ error: reason }, { status: 401 })
      : NextResponse.redirect(
          new URL(
            `/login${reason === "suspended" ? "?error=suspended" : ""}`,
            request.url,
          ),
        );
    response.cookies.delete(COOKIE);
    return response;
  }
  if (
    request.nextUrl.pathname.startsWith("/superadmin") &&
    user.role !== "SUPERADMIN"
  )
    return NextResponse.redirect(
      new URL("/dashboard?error=forbidden", request.url),
    );
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: ["/dashboard/:path*", "/superadmin/:path*", "/api/:path*"],
};
