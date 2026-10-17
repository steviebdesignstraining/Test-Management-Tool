export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";
import { ROLE_OPTIONS, isValidRole } from "@/lib/permissions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  const { projectId } = await params;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50")));
  const skip = (page - 1) * pageSize;

  const canView = await canAccessProject(user.id, projectId, "VIEWER");
  if (!canView) return error("Forbidden", 403);

  const [items, total] = await Promise.all([
    prisma.projectMember.findMany({
      skip,
      take: pageSize,
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.projectMember.count({ where: { projectId } }),
  ]);

  return paginated(items, page, pageSize, total);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { projectId } = await params;
    const { userId, role } = await req.json();
    if (!userId) return error("userId is required", 400);

    const canManage = await canAccessProject(user.id, projectId, "OWNER");
    if (!canManage) return error("Only project owners can add members", 403);

    const validRole = isValidRole(role) ? role.toUpperCase() : "TESTER";

    const member = await prisma.projectMember.create({
      data: { projectId, userId, role: validRole },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return json(member, 201);
  } catch {
    return error("Failed to add project member", 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return error("userId is required", 400);

    const canManage = await canAccessProject(user.id, projectId, "OWNER");
    if (!canManage) return error("Only project owners can remove members", 403);

    if (userId === user.id) {
      const otherOwners = await prisma.projectMember.count({
        where: { projectId, role: "OWNER", userId: { not: userId } },
      });
      if (otherOwners === 0) return error("Cannot remove yourself as the sole owner", 409);
    }

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } },
    });
    return json({ success: true });
  } catch {
    return error("Failed to remove member", 500);
  }
}

export async function canAccessProject(
  userId: string,
  projectId: string | null | undefined,
  minRole: string,
): Promise<boolean> {
  if (!projectId) return false;
  const roleOrder = ["VIEWER", "TESTER", "MANAGER", "OWNER"];
  const minIdx = roleOrder.indexOf(minRole.toUpperCase());
  const member = await prisma.projectMember.findFirst({
    where: { userId, projectId },
  });
  if (!member) return false;
  const userIdx = roleOrder.indexOf(member.role.toUpperCase());
  return userIdx >= minIdx;
}
