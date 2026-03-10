import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
const PUBLIC_PATHS = ["/login", "/register", "/api/auth/login", "/api/auth/register", "/api/auth/me"];
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".")) return NextResponse.next();
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) { if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); return NextResponse.redirect(new URL("/login", req.url)); }
  const session = await verifyToken(token);
  if (!session) { if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Invalid session" }, { status: 401 }); const res = NextResponse.redirect(new URL("/login", req.url)); res.cookies.delete(COOKIE_NAME); return res; }
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) { if (session.role !== "admin") { if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Admin only" }, { status: 403 }); return NextResponse.redirect(new URL("/", req.url)); } }
  if (session.role === "viewer" && pathname.startsWith("/api/")) { const method = req.method; if (method !== "GET" && !pathname.startsWith("/api/auth")) return NextResponse.json({ error: "Read-only access" }, { status: 403 }); }
  const res = NextResponse.next();
  res.headers.set("x-user-id", session.userId); res.headers.set("x-user-role", session.role); res.headers.set("x-user-email", session.email);
  return res;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
