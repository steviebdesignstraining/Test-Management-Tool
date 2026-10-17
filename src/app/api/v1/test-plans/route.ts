import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { withAuth, requireProjectAccess } from "@/lib/session";


export async function GET(req: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const skip = (page - 1) * pageSize;

    if (!projectId) {
      return error("projectId query parameter is required", 400);
    }
    await requireProjectAccess(user.id, projectId);

    const where = { projectId };

    const [items, total] = await Promise.all([
      prisma.testPlan.findMany({ skip, take: pageSize, where, include: { suites: true } }),
      prisma.testPlan.count({ where }),
    ]);

    return paginated(items, page, pageSize, total);
  });
}

export async function POST(req: Request) {
  return withAuth(async (user) => {
    try {
      const { name, description, projectId } = await req.json();
      if (!name || !projectId) return error("Name and projectId are required", 400);

      await requireProjectAccess(user.id, projectId);

      const plan = await prisma.testPlan.create({ data: { name, description, projectId } });
      return json(plan, 201);
    } catch (err) {
      const status = (err as { status?: number })?.status ?? 500;
      const message = err instanceof Error ? err.message : "Failed to create test plan";
      if (status >= 500) console.error("POST /test-plans error:", err);
      return error(message, status);
    }
  });
}