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
        key,
        title,
        projectId,
        ownerId,
        steps: steps
          ? {
              create: steps.map((s: any, i: number) => ({
                action: s.action,
                expectedResult: s.expectedResult,
                data: s.data || null,
                position: s.position ?? i + 1,
              })),
            }
          : undefined,
      },
      include: { steps: { orderBy: { position: "asc" } } },
    });

    return json(testCase, 201);
  } catch (err: any) {
    if (err.code === "P2002") {
      return error("Test case key already exists", 409);
    }
    return error("Failed to create test case", 500);
  }
}
