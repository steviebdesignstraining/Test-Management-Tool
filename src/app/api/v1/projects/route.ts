import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { sanitizeInput } from "@/lib/validation";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
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
      data: {
        name: sanitizeInput(String(name)),
        description: description ? sanitizeInput(String(description)) : undefined,
        organisationId,
      },
    });
    return json(project, 201);
  } catch {
    return error("Failed to create project", 500);
  }
}
