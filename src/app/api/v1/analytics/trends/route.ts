export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const days = parseInt(searchParams.get("days") || "30");

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const executions = await prisma.testExecution.findMany({
      where: { ...where, createdAt: { gte: startDate } },
      orderBy: { createdAt: "asc" },
      select: { id: true, status: true, createdAt: true, testCaseId: true },
    });

    // Group by date
    const byDate: Record<string, { passed: number; failed: number; total: number }> = {};
    executions.forEach((e) => {
      const date = e.createdAt.toISOString().slice(0, 10);
      if (!byDate[date]) byDate[date] = { passed: 0, failed: 0, total: 0 };
      byDate[date].total += 1;
      if (e.status === "PASSED") byDate[date].passed += 1;
      if (e.status === "FAILED") byDate[date].failed += 1;
    });

    const trend = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }));

    const ciRuns = await prisma.ciRun.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        pipelineName: true,
        buildNumber: true,
        status: true,
        branch: true,
        createdAt: true,
        duration: true,
      },
    });

    return json({
      trend,
      ciRuns,
      totalExecutions: executions.length,
      period: { days, startDate: startDate.toISOString() },
    });
  } catch {
    return error("Failed to fetch trends", 500);
  }
}
