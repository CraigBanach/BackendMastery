import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/sitemap.xml" ||
    request.nextUrl.pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  const authResponse = await auth0.middleware(request);
  authResponse.headers.set("x-current-path", request.nextUrl.pathname);

  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authResponse;
  }

  const session = await auth0.getSession(request);

  if (session) {
    if (request.nextUrl.pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/budget";
      return NextResponse.redirect(url);
    }
  } else {
    if (
      request.nextUrl.pathname !== "/" &&
      request.nextUrl.pathname !== "/free-budget-template" &&
      request.nextUrl.pathname !== "/free-month-budget-review" &&
      request.nextUrl.pathname !== "/tools" &&
      request.nextUrl.pathname !== "/tools/mortgage-deposit-vs-invest-calculator" &&
      request.nextUrl.pathname !== "/personifi-opengraph-image.png" &&
      !request.nextUrl.pathname.startsWith("/stories") &&
      !request.nextUrl.pathname.startsWith("/ingest") &&
      !request.nextUrl.pathname.startsWith("/api/posthog-config")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return authResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
