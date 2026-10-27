import { NextResponse } from "next/server";

/**
 * Next.js Edge Proxy for Server-Level Route Protection:
 * Blocks unauthenticated visitors (guests) from accessing /admin/* and /dashboard/*
 * at the network layer. Users cannot bypass this by editing the URL or browser state.
 */
export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Check for Better-Auth session cookie or synchronized session indicator
  const sessionToken =
    request.cookies.get("my_app_v2.session_token")?.value ||
    request.cookies.get("__Secure-my_app_v2.session_token")?.value ||
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("findora_session")?.value;

  const isGuest = !sessionToken;

  // 1. Protect Admin section from guests
  if (pathname.startsWith("/admin")) {
    if (isGuest) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect Dashboard section from guests
  if (pathname.startsWith("/dashboard")) {
    if (isGuest) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect Report Creation and Editing from guests
  if (pathname === "/reports/new" || pathname.startsWith("/reports/") && pathname.endsWith("/edit")) {
    if (isGuest) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/reports/new",
    "/reports/:id/edit",
  ],
};
