import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { sanitizeInput } from "@/lib/validation";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const testCaseId = searchParams.get("testCaseId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
  const skip = (page - 1) * pageSize;

  const where = testCaseId ? { testCaseId } : {};

  const [items, total] = await Promise.all([
    prisma.testExecution.findMany({
      skip,
      take: pageSize,
      where,
      include: { testCase: true, tester: true, stepResults: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.testExecution.count({ where }),
  ]);

  return paginated(items, page, pageSize, total);
}

export async function POST(req: Request) {
  try {
    const {
      testCaseId,
      status,
      actualResult,
      testerId,
      environment,
      build,
      startedAt,
      endedAt,
    } = await req.json();

    if (!testCaseId || !testerId) {
      return error("testCaseId and testerId are required", 400);
    }

    const execution = await prisma.testExecution.create({
      data: {
        testCaseId,
        status,
        actualResult: actualResult ? sanitizeInput(String(actualResult)) : undefined,
        testerId,
        environment: environment ? sanitizeInput(String(environment)) : undefined,
        build: build ? sanitizeInput(String(build)) : undefined,
        startedAt: startedAt ? new Date(startedAt) : undefined,
        endedAt: endedAt ? new Date(endedAt) : undefined,
      },
      include: { testCase: true, tester: true },
    });
    return json(execution, 201);
  } catch {
    return error("Failed to create test execution", 500);
  }
}
