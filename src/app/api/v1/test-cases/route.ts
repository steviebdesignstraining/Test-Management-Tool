import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const skip = (page - 1) * pageSize;

  const where = projectId ? { projectId } : {};

  const [items, total] = await Promise.all([
    prisma.testCase.findMany({
      skip,
      take: pageSize,
      where,
      include: { project: true, owner: true, steps: { orderBy: { position: "asc" } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.testCase.count({ where }),
  ]);

  return paginated(items, page, pageSize, total);
}

export async function POST(req: Request) {
  try {
    const {
      key,
      title,
      description,
      objective,
      preconditions,
      testData,
      priority,
      severity,
      component,
      labels,
      projectId,
      ownerId,
      status,
      estimatedDuration,
    } = await req.json();

    if (!title || !projectId || !ownerId) {
      return error("Title, projectId and ownerId are required", 400);
    }

    const testCase = await prisma.testCase.create({
      data: {
        key,
        title,
        description,
        objective,
        preconditions,
        testData,
        priority,
        severity,
        component,
        labels,
        projectId,
        ownerId,
        status,
        estimatedDuration,
      },
      include: { project: true, owner: true },
    });
    return json(testCase, 201);
  } catch {
    return error("Failed to create test case", 500);
  }
}
