import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
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
      data: { key, title, description, type, priority, status, projectId, ownerId },
      include: { project: true, owner: true },
    });
    return json(requirement, 201);
  } catch {
    return error("Failed to create requirement", 500);
  }
}
