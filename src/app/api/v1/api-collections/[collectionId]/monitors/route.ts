import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ collectionId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { collectionId } = await params;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50")));
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.apiMonitor.findMany({
        skip,
        take: pageSize,
        where: { collectionId },
        include: { _count: { select: { runs: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.apiMonitor.count({ where: { collectionId } }),
    ]);

    return paginated(items, page, pageSize, total);
  } catch {
    return error("Failed to fetch API monitors", 500);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ collectionId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { collectionId } = await params;
    const { name, endpointId, schedule, isEnabled, assertions } = await req.json();
    if (!name || !schedule) return error("name and schedule are required", 400);

    const monitor = await prisma.apiMonitor.create({
      data: {
        collectionId,
        endpointId: endpointId || null,
        name,
        schedule,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        assertions: assertions ?? null,
      },
    });
    return json(monitor, 201);
  } catch {
    return error("Failed to create API monitor", 500);
  }
}
