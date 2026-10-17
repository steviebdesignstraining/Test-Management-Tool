import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, type CurrentUser } from "@/lib/auth-utils";
import { hasRole, type Role } from "@/lib/permissions";

type Fail = { ok: false; res: NextResponse };

const fail = (message: string, status: number): Fail => ({
  ok: false,
  res: NextResponse.json({ error: message }, { status }),
});

const isPlatformAdmin = (user: CurrentUser) => user.role === "ADMIN";

export async function requireUser(): Promise<{ ok: true; user: CurrentUser } | Fail> {
  const user = await getCurrentUser();
  return user ? { ok: true, user } : fail("Authentication required", 401);
}

export async function requireProjectRole(
  user: CurrentUser,
  projectId: string,
  min: Role,
): Promise<{ ok: true; role: Role | "ADMIN" } | Fail> {
  if (isPlatformAdmin(user)) return { ok: true, role: "ADMIN" };
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } },
    select: { role: true },
  });
  if (!member) return fail("Not found", 404);
  const role = member.role.toUpperCase() as Role;
  return hasRole(role, min) ? { ok: true, role } : fail("Insufficient permissions", 403);
}

export async function accessibleProjectIds(user: CurrentUser): Promise<string[] | null> {
  if (isPlatformAdmin(user)) return null;
  const rows = await prisma.projectMember.findMany({
    where: { userId: user.id },
    select: { projectId: true },
  });
  return rows.map((r) => r.projectId);
}

export const scope = (ids: string[] | null) => (ids === null ? undefined : { in: ids });

export async function projectIdOfTestCase(testCaseId: string): Promise<string | null> {
  const tc = await prisma.testCase.findUnique({ where: { id: testCaseId }, select: { projectId: true } });
  return tc?.projectId ?? null;
}

export function pick<T extends Record<string, unknown>>(body: T, allowed: readonly string[]) {
  const out: Record<string, unknown> = {};
  for (const k of allowed) if (body && k in body && body[k] !== undefined) out[k] = body[k];
  return out;
}

export async function assertUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required");
  return user;
}

export async function assertProjectRole(user: CurrentUser, projectId: string, min: Role) {
  const r = await requireProjectRole(user, projectId, min);
  if (!r.ok) throw new Error(r.res.status === 403 ? "Insufficient permissions" : "Not found");
}

export async function assertTestCaseRole(user: CurrentUser, testCaseId: string, min: Role) {
  const projectId = await projectIdOfTestCase(testCaseId);
  if (!projectId) throw new Error("Not found");
  await assertProjectRole(user, projectId, min);
}