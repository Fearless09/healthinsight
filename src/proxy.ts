import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

const SESSION_COOKIE_NAME = "healthinsight_session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  console.log({ name: "proxy", pathname, token, session });

  const isProtectedPath =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/datasets") ||
    pathname.startsWith("/documents") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/assistant") ||
    pathname.startsWith("/audit-logs") ||
    pathname.startsWith("/compare") ||
    pathname.startsWith("/team");

  const isAuthPath = pathname.startsWith("/login");

  // Protect dashboard routes when user is not logged in or session returns null
  if (isProtectedPath && !session) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    const res = NextResponse.redirect(loginUrl);
    if (token) res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  // Redirect authenticated users accessing /login or / to /dashboard
  if ((isAuthPath || pathname === "/") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes handled separately)
     * - uploads/ (public upload assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|uploads/).*)",
  ],
};
