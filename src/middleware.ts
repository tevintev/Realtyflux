import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except the login and password-recovery pages,
  // which must stay reachable without a session)
  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.includes(pathname)) {
    const session = request.cookies.get("admin_session")?.value;

    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const payload = await decrypt(session);
    if (!payload) {
      // Session is expired or invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_session");
      return response;
    }
  }

  // Redirect to dashboard if logged in and trying to access the login page
  if (pathname === "/admin/login") {
    const session = request.cookies.get("admin_session")?.value;
    if (session) {
      const payload = await decrypt(session);
      if (payload) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Intercept all requests starting with /admin
export const config = {
  matcher: ["/admin/:path*"],
};
