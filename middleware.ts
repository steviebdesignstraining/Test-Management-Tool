import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getJwtSecret } from "@/lib/session";
import jwt from "jsonwebtoken";

const publicRoutes = ["/sign-in", "/register", "/forgot-password", "/reset-password"];

const roleHierarchy: Record<string, number> = {
  READ_ONLY: 0,
  USER: 1,
  TESTER: 2,
  QA_LEAD: 3,
  PROJECT_ADMIN: 4,
  ORG_ADMIN: 5,
  ADMIN: 6,
};

const roleLevels: Record<string, string[]> = {
  "/admin": ["ADMIN", "ORG_ADMIN"],
  "/settings": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN"],
  "/team": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN", "QA_LEAD"],
  "/requirements": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN", "QA_LEAD", "TESTER", "USER"],
  "/test-cases": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN", "QA_LEAD", "TESTER", "USER"],
  "/test-plans": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN", "QA_LEAD", "TESTER", "USER"],
  "/test-runs": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN", "QA_LEAD", "TESTER", "USER"],
  "/defects": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN", "QA_LEAD", "TESTER", "USER"],
  "/projects": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN", "QA_LEAD", "TESTER", "USER"],
};

function getAllowedRoles(pathname: string): string[] | null {
  for (const [prefix, roles] of Object.entries(roleLevels)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return roles;
    }
  }
  return null;
}

function roleLevel(role: string): number {
  return roleHierarchy[role] ?? 0;
}

function verifyToken(token: string): { userId: string; role?: string } | null {
  try {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret) as { userId: string; role?: string };
    if (!payload || typeof payload.userId !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;

  let userId: string | null = null;
  let userRole: string | null = null;
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      userId = payload.userId;
      userRole = payload.role ?? null;
    }
  }

  const isPublic = publicRoutes.includes(pathname) || pathname === "/";

  if (isPublic) {
    if (userId) {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
    return NextResponse.next();
  }

  if (!userId) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const allowedRoles = getAllowedRoles(pathname);
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    const level = roleLevel(userRole);
    const maxAllowed = Math.max(...allowedRoles.map((r) => roleLevel(r)));
    if (level < maxAllowed) {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};