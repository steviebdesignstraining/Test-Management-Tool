export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { withAuth, requireProjectAccess } from "@/lib/session";
import { sanitizeInput } from "@/lib/validation";
import { FIELD_LIMITS } from "@/lib/validation";

export async function GET(req: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const skip = (page - 1) * pageSize;

    if (!projectId) {
      return error("projectId query parameter is required", 400);
    }
    await requireProjectAccess(user.id, projectId);

    const where = { testCase: { projectId } };

    const [items, total] = await Promise.all([
      prisma.testExecution.findMany({
        skip, take: pageSize, where,
        include: { testCase: true, stepResults: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.testExecution.count({ where }),
    ]);

    return paginated(items, page, pageSize, total);
  });
}

export async function POST(req: Request) {
  return withAuth(async (user) => {
    try {
      const { testCaseId, status, actualResult, testerId, environment, build } = await req.json();
      if (!testCaseId || !testerId) return error("testCaseId and testerId required", 400);

      const testCase = await prisma.testCase.findUnique({ where: { id: testCaseId }, select: { projectId: true } });
      if (!testCase) return error("Test case not found", 404);

      await requireProjectAccess(user.id, testCase.projectId);
      if (testerId !== user.id) {
        await requireProjectAccess(testerId, testCase.projectId);
      }

      const execution = await prisma.testExecution.create({
        data: {
          testCaseId,
          status: status || "NOT_RUN",
          actualResult: actualResult ? sanitizeInput(String(actualResult)).slice(0, FIELD_LIMITS.description) : null,
          testerId,
          environment: environment ? sanitizeInput(String(environment)) : null,
          build: build ? sanitizeInput(String(build)) : null,
        },
      });
      return json(execution, 201);
    } catch (err) {
      const status = (err as { status?: number })?.status ?? 500;
      const message = err instanceof Error ? err.message : "Failed to create test execution";
      if (status >= 500) console.error("POST /test-executions error:", err);
      return error(message, status);
    }
  });
}