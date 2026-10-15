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
    prisma.testPlan.findMany({ skip, take: pageSize, where, include: { suites: true } }),
    prisma.testPlan.count({ where }),
  ]);

  return paginated(items, page, pageSize, total);
}

export async function POST(req: Request) {
  try {
    const { name, description, projectId } = await req.json();
    if (!name || !projectId) return error("Name and projectId are required", 400);

    const plan = await prisma.testPlan.create({ data: { name, description, projectId } });
    return json(plan, 201);
  } catch {
    return error("Failed to create test plan", 500);
  }
}
