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

    const [casesByType, plansWithCases, allureReports] = await Promise.all([
      prisma.testCase.groupBy({
        by: ["testType"],
        where,
        _count: { testType: true },
      }),
      prisma.testPlan.findMany({
        where,
        include: {
          suites: {
            include: {
              cases: { include: { testCase: true } },
            },
          },
        },
      }),
      prisma.allureReport.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const typeCoverage = casesByType.map((c) => ({
      type: c.testType || "UNLABELED",
      count: c._count.testType,
    }));

    const totalCases = typeCoverage.reduce((sum, t) => sum + t.count, 0);

    const planCoverage = plansWithCases.map((plan) => {
      let totalInPlan = 0;
      for (const suite of plan.suites) {
        totalInPlan += suite.cases.length;
      }
      return {
        planId: plan.id,
        planName: plan.name,
        totalCases: totalInPlan,
      };
    });

    const allureSummary = allureReports.map((r) => ({
      id: r.id,
      name: r.name,
      totalTests: r.totalTests,
      passedTests: r.passedTests,
      failedTests: r.failedTests,
      passRate: r.totalTests > 0 ? Math.round((r.passedTests / r.totalTests) * 100) : 0,
      createdAt: r.createdAt,
    }));

    return json({
      totalCases,
      typeCoverage,
      planCoverage,
      allureSummary,
    });
  } catch {
    return error("Failed to fetch coverage analytics", 500);
  }
}
