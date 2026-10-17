export const revalidate = 0;
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ testCaseId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { testCaseId } = await params;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50")));
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.testParameter.findMany({
        skip,
        take: pageSize,
        where: { testCaseId },
        orderBy: { position: "asc" },
      }),
      prisma.testParameter.count({ where: { testCaseId } }),
    ]);

    return paginated(items, page, pageSize, total);
  } catch {
    return error("Failed to fetch parameters", 500);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ testCaseId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { testCaseId } = await params;
    const { name, value, description, isRequired, position } = await req.json();
    if (!name || !value) return error("name and value are required", 400);

    const parameter = await prisma.testParameter.create({
      data: {
        testCaseId,
        name,
        value,
        description,
        isRequired: Boolean(isRequired),
        position: position ?? 0,
      },
    });
    return json(parameter, 201);
  } catch {
    return error("Failed to create parameter", 500);
  }
}

export async function generateStaticParams() {
  return [];
}
