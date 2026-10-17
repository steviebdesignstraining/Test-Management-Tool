export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { sanitizeInput } from "@/lib/validation";
import { withAuth, requireProjectAccess } from "@/lib/session";

export async function GET(req: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const skip = (page - 1) * pageSize;

    if (!projectId) {
      return error("projectId is required", 400);
    }
    await requireProjectAccess(user.id, projectId);

    const where = { projectId };

    const [items, total] = await Promise.all([
      prisma.testCase.findMany({
        skip,
        take: pageSize,
        where,
        include: { steps: { orderBy: { position: "asc" } } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.testCase.count({ where }),
    ]);

    return paginated(items, page, pageSize, total);
  });
}

export async function POST(req: Request) {
  return withAuth(async (user) => {
    try {
      const body = await req.json();
      const { key, title, projectId, ownerId, steps, ...rest } = body;

      if (!key || !title || !projectId) {
        return error("Key, title, and projectId are required", 400);
      }

      await requireProjectAccess(user.id, projectId);
      if (ownerId && ownerId !== user.id) {
        await requireProjectAccess(ownerId, projectId);
      }
      const effectiveOwnerId = ownerId || user.id;

      const testCase = await prisma.testCase.create({
        data: {
          key: sanitizeInput(String(key)),
          title: sanitizeInput(String(title)),
          projectId,
          ownerId: effectiveOwnerId,
          steps: steps
            ? {
                create: steps.map((s: { action: string; expectedResult: string; data?: string; position?: number }, i: number) => ({
                  action: sanitizeInput(String(s.action)),
                  expectedResult: sanitizeInput(String(s.expectedResult)),
                  data: s.data ? sanitizeInput(String(s.data)) : null,
                  position: s.position ?? i + 1,
                })),
              }
            : undefined,
          ...rest,
        },
      });

      return json(testCase, 201);
    } catch {
      return error("Failed to create test case", 500);
    }
  });
}