export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.organisation.findMany({ skip, take: pageSize }),
    prisma.organisation.count(),
  ]);

  return paginated(items, page, pageSize, total);
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) return error("Name is required", 400);

    const org = await prisma.organisation.create({ data: { name } });
    return json(org, 201);
  } catch {
    return error("Failed to create organisation", 500);
  }
}
