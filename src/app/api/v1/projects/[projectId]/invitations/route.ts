import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";
import { canAccess, ROLE_OPTIONS } from "@/lib/permissions";
import { nanoid } from "nanoid";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { projectId } = await params;
    const member = await canAccess(user.id, projectId, "OWNER");
    if (!member) return error("Only project owners can view invitations", 403);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50")));
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.projectInvitation.findMany({
        skip,
        take: pageSize,
        where: { projectId },
        include: { invitee: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.projectInvitation.count({ where: { projectId } }),
    ]);

    return paginated(items, page, pageSize, total);
  } catch {
    return error("Failed to fetch invitations", 500);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  const { projectId } = await params;
  const member = await canAccess(user.id, projectId, "OWNER");
  if (!member) return error("Only project owners can invite members", 403);

  try {
    const { email, role } = await req.json();
    if (!email) return error("Email is required", 400);

    const validRole = ROLE_OPTIONS.some((r) => r.value === role?.toUpperCase())
      ? role.toUpperCase()
      : "TESTER";

    const existingMember = await prisma.projectMember.findFirst({
      where: { projectId, user: { email: String(email).toLowerCase() } },
    });
    if (existingMember) return error("User is already a project member", 409);

    const existingInvite = await prisma.projectInvitation.findFirst({
      where: { projectId, inviteeEmail: String(email).toLowerCase() },
    });
    if (existingInvite && existingInvite.expiresAt < new Date()) {
      await prisma.projectInvitation.update({
        where: { id: existingInvite.id },
        data: { token: nanoid(32), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), role: validRole, createdById: user.id },
      });
      return json(existingInvite, 200);
    }
    if (existingInvite) return json(existingInvite, 200);

    const invite = await prisma.projectInvitation.create({
      data: {
        projectId,
        inviteeEmail: String(email).toLowerCase(),
        role: validRole,
        token: nanoid(32),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdById: user.id,
      },
    });

    return json(invite, 201);
  } catch {
    return error("Failed to create invitation", 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  const { projectId } = await params;
  const member = await canAccess(user.id, projectId, "OWNER");
  if (!member) return error("Only project owners can delete invitations", 403);

  try {
    const { searchParams } = new URL(req.url);
    const invitationId = searchParams.get("invitationId");
    if (!invitationId) return error("invitationId is required", 400);

    await prisma.projectInvitation.delete({
      where: { id: invitationId, projectId },
    });
    return json({ success: true });
  } catch {
    return error("Failed to delete invitation", 500);
  }
}
