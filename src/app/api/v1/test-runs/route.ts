import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
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
      data: { testCaseId, testerId, status, environment, build },
      include: { stepResults: true },
    });
    return json(execution, 201);
  } catch {
    return error("Failed to create execution", 500);
  }
}
