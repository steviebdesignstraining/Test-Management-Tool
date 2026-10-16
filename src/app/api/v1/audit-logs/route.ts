import { prisma } from "@/lib/prisma";
import { error, paginated } from "@/lib/api-response";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
    const userId = searchParams.get("userId") || undefined;
    const action = searchParams.get("action") || undefined;

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return paginated(items, page, pageSize, total);
  } catch {
    return error("Failed to load audit logs", 500);
  }
}

export async function POST() {
  return error("Method not allowed", 405);
}
