import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { sanitizeInput } from "@/lib/validation";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
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
    const body = await req.json();
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
      testType,
      gherkinText,
      projectId,
      ownerId,
      status,
      estimatedDuration,
    } = body;

    if (!title || !projectId || !ownerId) {
      return error("Title, projectId and ownerId are required", 400);
    }

    const testCase = await prisma.testCase.create({
      data: {
        key: key ? sanitizeInput(String(key)) : (undefined as unknown as string),
        title: sanitizeInput(String(title)),
        description: description ? sanitizeInput(String(description)) : undefined,
        objective: objective ? sanitizeInput(String(objective)) : undefined,
        preconditions: preconditions ? sanitizeInput(String(preconditions)) : undefined,
        testData: testData ? sanitizeInput(String(testData)) : undefined,
        priority,
        severity,
        component: component ? sanitizeInput(String(component)) : undefined,
        labels: Array.isArray(labels) ? labels : typeof labels === "string" ? [labels] : undefined,
        testType: testType || null,
        gherkinText: gherkinText ? sanitizeInput(String(gherkinText)) : null,
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
