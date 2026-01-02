// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/product",
  "/review",
  "/profile",
  "/settings",
  "/manage",
];
const adminRoutes = ["/manage"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Get user info from session storage (via cookies or headers)
    const userInfoCookie = request.cookies.get("user_info");
    let userRole = null;

    if (userInfoCookie) {
      try {
        const userInfo = JSON.parse(decodeURIComponent(userInfoCookie.value));
        userRole = userInfo.role;
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    }

    // If no user info, redirect to signin
    if (!userRole) {
      const signinUrl = new URL("/signin", request.url);
      return NextResponse.redirect(signinUrl);
    }

    // If trying to access admin route without admin role
    if (isAdminRoute && userRole !== "Admin") {
      const notFoundUrl = new URL("/not-found", request.url);
      return NextResponse.redirect(notFoundUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/product/:path*",
    "/review/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/manage/:path*",
  ],
};
