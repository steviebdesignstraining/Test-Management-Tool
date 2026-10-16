import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { sanitizeInput } from "@/lib/validation";
import { FIELD_LIMITS } from "@/lib/validation";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
  const skip = (page - 1) * pageSize;

  const where = projectId ? { testCase: { projectId } } : {};

  const [items, total] = await Promise.all([
    prisma.testExecution.findMany({
      skip, take: pageSize, where,
      include: { testCase: true, stepResults: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.testExecution.count({ where }),
  ]);

  return paginated(items, page, pageSize, total);
}

export async function POST(req: Request) {
  try {
    const { testCaseId, testerId, status, environment, build } = await req.json();
    if (!testCaseId || !testerId) {
      return error("testCaseId and testerId are required", 400);
    }
    if (status && !["PASSED", "FAILED", "BLOCKED", "SKIPPED", "NOT_RUN"].includes(status)) {
      return error("Invalid status value", 400);
    }

    const execution = await prisma.testExecution.create({
      data: {
        testCaseId,
        testerId,
        status,
        environment: environment ? sanitizeInput(String(environment)).slice(0, FIELD_LIMITS.component) : undefined,
        build: build ? sanitizeInput(String(build)).slice(0, FIELD_LIMITS.component) : undefined,
      },
      include: { stepResults: true },
    });
    return json(execution, 201);
  } catch {
    return error("Failed to create execution", 500);
  }
}
