import { prisma } from "@/lib/prisma";

export const ROLES = ["VIEWER", "TESTER", "MANAGER", "OWNER"] as const;
export type Role = (typeof ROLES)[number];

export const roleHierarchy: Record<Role, number> = {
  VIEWER: 0,
  TESTER: 1,
  MANAGER: 2,
  OWNER: 3,
};

export function hasRole(userRole: Role | string, minRole: Role | string): boolean {
  const ur = userRole.toUpperCase() as Role;
  const mr = minRole.toUpperCase() as Role;
  return (roleHierarchy[ur] ?? -1) >= (roleHierarchy[mr] ?? 0);
}

export interface PermissionCheck {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}

export const rolePermissions: Record<Role, PermissionCheck> = {
  OWNER: { canCreate: true, canEdit: true, canDelete: true, canView: true },
  MANAGER: { canCreate: true, canEdit: true, canDelete: true, canView: true },
  TESTER: { canCreate: true, canEdit: true, canDelete: false, canView: true },
  VIEWER: { canCreate: false, canEdit: false, canDelete: false, canView: true },
};

export async function getUserProjectRole(
  userId: string,
  projectId: string,
): Promise<Role | null> {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
    select: { role: true },
  });
  return member?.role.toUpperCase() as Role | null;
}

export async function canAccess(
  userId: string,
  projectId: string,
  minRole: Role,
): Promise<boolean> {
  const userRole = await getUserProjectRole(userId, projectId);
  if (!userRole) return false;
  return hasRole(userRole, minRole);
}

export function checkPermission(
  role: Role,
  action: "create" | "edit" | "delete" | "view",
): boolean {
  const perms = rolePermissions[role] ?? rolePermissions.VIEWER;
  const key = `can${action.charAt(0).toUpperCase()}${action.slice(1)}` as keyof PermissionCheck;
  return Boolean(perms[key]);
}
