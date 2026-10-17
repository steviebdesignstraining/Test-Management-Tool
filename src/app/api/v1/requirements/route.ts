import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { withAuth, requireProjectAccess } from "@/lib/session";
import { sanitizeInput } from "@/lib/validation";

export async function GET(req: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const skip = (page - 1) * pageSize;
    const projectId = searchParams.get("projectId") || undefined;

    if (projectId) {
      await requireProjectAccess(user.id, projectId);
    }

    const where = projectId ? { projectId } : {};

    const [items, total] = await Promise.all([
      prisma.requirement.findMany({
        skip,
        take: pageSize,
        where,
        include: { project: true, owner: true },
        orderBy: { key: "asc" },
      }),
      prisma.requirement.count({ where }),
    ]);

    return paginated(items, page, pageSize, total);
  });
}

export async function POST(req: Request) {
  return withAuth(async (user) => {
    try {
      const { key, title, description, type, priority, status, projectId, ownerId } = await req.json();
      if (!key || !title || !projectId || !ownerId) {
        return error("Key, title, project and owner are required", 400);
      }

      await requireProjectAccess(user.id, projectId);
      if (ownerId !== user.id) {
        await requireProjectAccess(ownerId, projectId);
      }

      const reqObj = await prisma.requirement.create({
        data: {
          key: sanitizeInput(String(key)),
          title: sanitizeInput(String(title)),
          description: description ? sanitizeInput(String(description)) : null,
          type: type || "FUNCTIONAL",
          priority: priority || "MEDIUM",
          status: status || "DRAFT",
          projectId,
          ownerId,
        },
      });
      return json(reqObj, 201);
    } catch (err) {
      const status = (err as { status?: number })?.status ?? 500;
      const message = err instanceof Error ? err.message : "Failed to create requirement";
      if (status >= 500) console.error("POST /requirements error:", err);
      return error(message, status);
    }
  });
}