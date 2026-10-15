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
    prisma.defect.findMany({ skip, take: pageSize, where, include: { testCase: true, testExecution: true } }),
    prisma.defect.count({ where }),
  ]);

  return paginated(items, page, pageSize, total);
}

export async function POST(req: Request) {
  try {
    const { title, description, testCaseId, reporterId, severity, priority } = await req.json();
    if (!title || !reporterId) return error("Title and reporterId required", 400);

    const defect = await prisma.defect.create({
      data: { title, description, testCaseId, reporterId, severity, priority },
    });
    return json(defect, 201);
  } catch {
    return error("Failed to create defect", 500);
  }
}
