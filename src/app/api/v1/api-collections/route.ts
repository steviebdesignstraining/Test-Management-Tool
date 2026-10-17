export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  req: Request,
  _params: { params: Promise<{}> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50")));
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;

    const [items, total] = await Promise.all([
      prisma.apiCollection.findMany({
        skip,
        take: pageSize,
        where,
        include: { _count: { select: { endpoints: true, monitors: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.apiCollection.count({ where }),
    ]);

    return paginated(items, page, pageSize, total);
  } catch {
    return error("Failed to fetch API collections", 500);
  }
}

export async function POST(
  req: Request,
  _params: { params: Promise<{}> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const { name, description, source, externalId, externalUrl } = await req.json();
    if (!name || !projectId) return error("name and projectId are required", 400);

    const collection = await prisma.apiCollection.create({
      data: {
        projectId,
        name,
        description,
        source: source ?? "MANUAL",
        externalId,
        externalUrl,
      },
    });
    return json(collection, 201);
  } catch {
    return error("Failed to create API collection", 500);
  }
}
