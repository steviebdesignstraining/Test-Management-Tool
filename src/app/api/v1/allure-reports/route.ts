import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  req: Request,
  _params: { params: Promise<{}> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50")));
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;

    const [items, total] = await Promise.all([
      prisma.allureReport.findMany({
        skip,
        take: pageSize,
        where,
        include: { ciRun: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.allureReport.count({ where }),
    ]);

    return paginated(items, page, pageSize, total);
  } catch {
    return error("Failed to fetch Allure reports", 500);
  }
}

export async function POST(
  req: Request,
  _params: { params: Promise<{}> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const { ciRunId, name, url, totalTests, passedTests, failedTests, brokenTests, skippedTests, duration, resultsJson } = await req.json();
    if (!name || totalTests === undefined || !projectId) return error("name, totalTests, and projectId are required", 400);

    const report = await prisma.allureReport.create({
      data: {
        projectId,
        ciRunId: ciRunId || null,
        name,
        url,
        totalTests,
        passedTests: passedTests ?? 0,
        failedTests: failedTests ?? 0,
        brokenTests: brokenTests ?? 0,
        skippedTests: skippedTests ?? 0,
        duration,
        resultsJson: resultsJson ?? null,
      },
    });
    return json(report, 201);
  } catch {
    return error("Failed to create Allure report", 500);
  }
}
