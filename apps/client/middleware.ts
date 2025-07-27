import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "./src/auth";

export default auth((req: NextRequest & { auth: any }) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Define public routes (accessible without authentication)
  const publicRoutes = ["/", "/login"];
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // Define protected routes (require authentication)
  const protectedRoutes = ["/dashboard", "/pets", "/profile"];
  const isProtectedRoute = protectedRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  );

  // If user is not logged in and trying to access protected route
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // If user is logged in and trying to access login page, redirect to dashboard
  if (isLoggedIn && nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

// Configure which routes to run middleware on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
