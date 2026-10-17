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

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;

    const [totalCases, totalExecutions, passedExecutions, failedExecutions, totalDefects, openDefects, ciRuns, allureReports] =
      await Promise.all([
        prisma.testCase.count({ where }),
        prisma.testExecution.count({ where }),
        prisma.testExecution.count({ where: { ...where, status: "PASSED" } }),
        prisma.testExecution.count({ where: { ...where, status: "FAILED" } }),
        prisma.defect.count({ where }),
        prisma.defect.count({ where: { ...where, status: "OPEN" } }),
        prisma.ciRun.count({ where }),
        prisma.allureReport.count({ where }),
      ]);

    const passRate = totalExecutions > 0 ? Math.round((passedExecutions / totalExecutions) * 100) : 0;

    return json({
      totalTestCases: totalCases,
      totalExecutions,
      passedExecutions,
      failedExecutions,
      passRate,
      totalDefects,
      openDefects,
      ciRuns,
      allureReports,
      lastUpdated: new Date().toISOString(),
    });
  } catch {
    return error("Failed to fetch analytics overview", 500);
  }
}
