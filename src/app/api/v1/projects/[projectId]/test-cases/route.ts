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
      include: { steps: { orderBy: { position: "asc" } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.testCase.count({ where }),
  ]);

  return paginated(items, page, pageSize, total);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, title, projectId, ownerId, steps, ...rest } = body;

    if (!key || !title || !projectId) {
      return error("Key, title, and projectId are required", 400);
    }

    const testCase = await prisma.testCase.create({
      data: {
        key: sanitizeInput(String(key)),
        title: sanitizeInput(String(title)),
        projectId,
        ownerId,
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
      },
      include: { steps: { orderBy: { position: "asc" } } },
    });

    return json(testCase, 201);
  } catch (err) {
    const errorCode = (err as { code?: string }).code;
    if (errorCode === "P2002") {
      return error("Test case key already exists", 409);
    }
    return error("Failed to create test case", 500);
  }
}
