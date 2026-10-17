export const revalidate = 0;
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ monitorId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { monitorId } = await params;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50")));
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.apiMonitorRun.findMany({
        skip,
        take: pageSize,
        where: { monitorId },
        include: { _count: { select: { results: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.apiMonitorRun.count({ where: { monitorId } }),
    ]);

    return paginated(items, page, pageSize, total);
  } catch {
    return error("Failed to fetch monitor runs", 500);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ monitorId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { monitorId } = await params;
    const monitor = await prisma.apiMonitor.findUnique({ where: { id: monitorId } });
    if (!monitor) return error("Monitor not found", 404);

    const run = await prisma.apiMonitorRun.create({
      data: {
        monitorId,
        status: "RUNNING",
        startedAt: new Date(),
      },
    });
    return json(run, 201);
  } catch {
    return error("Failed to start monitor run", 500);
  }
}

export async function generateStaticParams() {
  return [];
}
