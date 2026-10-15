import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      skip,
      take: pageSize,
      include: { organisation: true },
    }),
    prisma.project.count(),
  ]);

  return paginated(items, page, pageSize, total);
}

export async function POST(req: Request) {
  try {
    const { name, description, organisationId } = await req.json();
    if (!name) return error("Name is required", 400);

    const project = await prisma.project.create({
      data: { name, description, organisationId },
    });
    return json(project, 201);
  } catch {
    return error("Failed to create project", 500);
  }
}
