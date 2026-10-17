import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/http-error";

/**
 * JWT secret used to sign and verify session tokens.
 *
 * The application refuses to start (or authenticate) when the secret is not
 * configured. A predictable fallback secret would allow attackers to forge
 * session tokens in any deployment that forgets to set AUTH_SECRET.
 */
export function getJwtSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.trim().length === 0) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: AUTH_SECRET environment variable is required in production. " +
          "Generate a strong secret (e.g. `openssl rand -base64 48`) and set it before starting the app.",
      );
    }
    throw new Error(
      "AUTH_SECRET is not set. Set a strong secret via the AUTH_SECRET environment variable.",
    );
  }
  return secret;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export interface DecodedSession {
  userId: string;
  role?: string;
}

export function decodeSessionToken(token: string): DecodedSession | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as DecodedSession;
    if (!payload || typeof payload.userId !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function authenticateRequest(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const decoded = decodeSessionToken(token);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await authenticateRequest();
  if (!user) {
    throw new HttpError("Not authenticated", 401);
  }
  return user;
}

export interface OrganisationMembership {
  organisationId: string;
  organisationName: string;
  role: string;
}

export async function requireOrganisationAccess(
  userId: string,
  organisationId: string,
): Promise<OrganisationMembership> {
  const membership = await prisma.organisationMember.findUnique({
    where: { userId_organisationId: { userId, organisationId } },
    include: { organisation: { select: { id: true, name: true } } },
  });
  if (!membership) {
    throw new HttpError("Not a member of this organisation", 403);
  }
  return {
    organisationId: membership.organisationId,
    organisationName: membership.organisation.name,
    role: membership.role,
  };
}

export interface ProjectMembership {
  projectId: string;
  role: string;
}

export async function requireProjectAccess(
  userId: string,
  projectId: string,
  minRole?: string,
): Promise<ProjectMembership> {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (!membership) {
    throw new HttpError("Not a member of this project", 403);
  }
  if (minRole) {
    const { hasRole } = await import("@/lib/permissions");
    if (!hasRole(membership.role, minRole)) {
      throw new HttpError("Insufficient project permissions", 403);
    }
  }
  return { projectId: membership.projectId, role: membership.role };
}

export async function requireUserOrganisation(
  userId: string,
  organisationId?: string | null,
): Promise<OrganisationMembership> {
  if (organisationId) {
    return requireOrganisationAccess(userId, organisationId);
  }

  const membership = await prisma.organisationMember.findFirst({
    where: { userId },
    include: { organisation: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    throw new HttpError("User is not a member of any organisation", 403);
  }

  return {
    organisationId: membership.organisationId,
    organisationName: membership.organisation.name,
    role: membership.role,
  };
}

export async function withAuth<T>(handler: (user: SessionUser) => Promise<T>) {
  try {
    const user = await requireAuth();
    return await handler(user);
  } catch (err) {
    if (err instanceof HttpError) {
      const { error } = await import("@/lib/api-response");
      return error(err.message, err.status);
    }
    const status = 500;
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("API handler error:", err);
    const { error } = await import("@/lib/api-response");
    return error(message, status);
  }
}

export async function requireTestCaseRole(
  userId: string,
  testCaseId: string,
  minRole: string,
): Promise<{ projectId: string }> {
  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    select: { projectId: true },
  });
  if (!testCase) {
    const err = new Error("Test case not found");
    (err as Error & { status?: number }).status = 404;
    throw err;
  }
  await requireProjectAccess(userId, testCase.projectId, minRole);
  return { projectId: testCase.projectId };
}