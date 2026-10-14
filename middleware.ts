import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/gccs", "/cities", "/providers", "/incentives", "/recommend", "/briefs", "/signals", "/chat", "/admin", "/settings", "/upload", "/data"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = Boolean(request.cookies.get("gcc_access_token")?.value);
  const requiresAuth = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (requiresAuth && !authenticated) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }
  if (authenticated && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};