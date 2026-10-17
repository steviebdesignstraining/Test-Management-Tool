export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { projectId } = await params;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50")));
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.thirdPartyIntegration.findMany({
        skip,
        take: pageSize,
        where: { projectId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.thirdPartyIntegration.count({ where: { projectId } }),
    ]);

    return paginated(items, page, pageSize, total);
  } catch {
    return error("Failed to fetch integrations", 500);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { projectId } = await params;
    const { type, name, config } = await req.json();
    if (!type || !name) return error("type and name are required", 400);

    const integration = await prisma.thirdPartyIntegration.create({
      data: { projectId, type, name, config: config ?? null },
    });
    return json(integration, 201);
  } catch {
    return error("Failed to create integration", 500);
  }
}
