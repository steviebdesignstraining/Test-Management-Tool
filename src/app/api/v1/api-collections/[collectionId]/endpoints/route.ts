import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ collectionId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { collectionId } = await params;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50")));
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.apiEndpoint.findMany({
        skip,
        take: pageSize,
        where: { collectionId },
        orderBy: { name: "asc" },
      }),
      prisma.apiEndpoint.count({ where: { collectionId } }),
    ]);

    return paginated(items, page, pageSize, total);
  } catch {
    return error("Failed to fetch API endpoints", 500);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ collectionId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { collectionId } = await params;
    const { name, method, url, headers, queryParams, body, authType, authConfig, timeout, expectedStatusCode } = await req.json();
    if (!name || !method || !url) return error("name, method, and url are required", 400);

    const endpoint = await prisma.apiEndpoint.create({
      data: {
        collectionId,
        name,
        method,
        url,
        headers: headers ?? null,
        queryParams: queryParams ?? null,
        body: body ?? null,
        authType,
        authConfig: authConfig ?? null,
        timeout: timeout ?? 30000,
        expectedStatusCode: expectedStatusCode ?? 200,
      },
    });
    return json(endpoint, 201);
  } catch {
    return error("Failed to create API endpoint", 500);
  }
}
