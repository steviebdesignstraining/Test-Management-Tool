export const dynamic = "force-dynamic";
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
      prisma.ciRun.findMany({
        skip,
        take: pageSize,
        where,
        include: { allureReport: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.ciRun.count({ where }),
    ]);

    return paginated(items, page, pageSize, total);
  } catch {
    return error("Failed to fetch CI runs", 500);
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
    const { pipelineId, pipelineName, buildNumber, status, branch, commitSha, commitMessage, startedAt, endedAt, duration } = await req.json();
    if (!pipelineId || !pipelineName || buildNumber === undefined || !projectId) return error("pipelineId, pipelineName, buildNumber, and projectId are required", 400);

    const ciRun = await prisma.ciRun.create({
      data: {
        projectId,
        pipelineId,
        pipelineName,
        buildNumber,
        status: status ?? "PENDING",
        branch,
        commitSha,
        commitMessage,
        startedAt: startedAt ? new Date(startedAt) : undefined,
        endedAt: endedAt ? new Date(endedAt) : undefined,
        duration,
      },
    });
    return json(ciRun, 201);
  } catch {
    return error("Failed to create CI run", 500);
  }
}
