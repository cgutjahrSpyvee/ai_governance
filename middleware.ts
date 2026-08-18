import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { SHOW_DEMO_DATA, DEMO_ONLY_ROUTES } from "@/lib/demo-mode";

const PUBLIC_PATHS = [
  "/login",
  "/accept-invite",
  "/api/auth",
  // render.yaml points its health check here; gating it behind auth makes the
  // probe follow a redirect to /login instead of getting a 200. The route
  // returns only {status:"ok"} and exposes nothing sensitive.
  "/api/healthz",
  "/_next",
  "/favicon.ico",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Screens with no live governance-engine source are not reachable at all
  // unless demo mode is explicitly enabled — hiding them from the nav is not
  // enough, since the URLs would still serve seeded figures.
  if (
    !SHOW_DEMO_DATA &&
    (DEMO_ONLY_ROUTES as readonly string[]).some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    )
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const role = token.role as string | undefined;

  // Super-admin-only sections
  if (pathname.startsWith("/super-admin") || pathname.startsWith("/api/admin")) {
    if (role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Org admin sections
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
