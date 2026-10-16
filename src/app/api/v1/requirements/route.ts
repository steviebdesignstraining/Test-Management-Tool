import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { sanitizeInput } from "@/lib/validation";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
  const skip = (page - 1) * pageSize;
  const projectId = searchParams.get("projectId") || undefined;

  const [items, total] = await Promise.all([
    prisma.requirement.findMany({
      skip,
      take: pageSize,
      where: projectId ? { projectId } : {},
      include: { project: true, owner: true },
      orderBy: { key: "asc" },
    }),
    prisma.requirement.count({ where: projectId ? { projectId } : {} }),
  ]);

  return paginated(items, page, pageSize, total);
}

export async function POST(req: Request) {
  try {
    const { key, title, description, type, priority, status, projectId, ownerId } = await req.json();
    if (!key || !title || !projectId || !ownerId) {
      return error("Key, title, project and owner are required", 400);
    }

    const requirement = await prisma.requirement.create({
      data: {
        key: sanitizeInput(String(key)),
        title: sanitizeInput(String(title)),
        description: description ? sanitizeInput(String(description)) : undefined,
        type,
        priority,
        status,
        projectId,
        ownerId,
      },
      include: { project: true, owner: true },
    });
    return json(requirement, 201);
  } catch {
    return error("Failed to create requirement", 500);
  }
}
