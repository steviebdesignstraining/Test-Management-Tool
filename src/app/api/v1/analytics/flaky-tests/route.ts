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

    // Flaky tests: test cases with both PASSED and FAILED executions
    const executions = await prisma.testExecution.findMany({
      where,
      include: { testCase: { select: { id: true, key: true, title: true } } },
      orderBy: { createdAt: "desc" },
    });

    const byTestCase: Record<string, { key: string; title: string; passed: number; failed: number; executions: number }> = {};
    executions.forEach((e) => {
      const tc = e.testCase;
      if (!tc) return;
      if (!byTestCase[tc.id]) {
        byTestCase[tc.id] = { key: tc.key, title: tc.title, passed: 0, failed: 0, executions: 0 };
      }
      byTestCase[tc.id].executions += 1;
      if (e.status === "PASSED") byTestCase[tc.id].passed += 1;
      if (e.status === "FAILED") byTestCase[tc.id].failed += 1;
    });

    const flakyTests = Object.values(byTestCase)
      .filter((tc) => tc.passed > 0 && tc.failed > 0)
      .map((tc) => ({
        ...tc,
        flakinessRate: Math.round((tc.failed / tc.executions) * 100),
      }))
      .sort((a, b) => b.flakinessRate - a.flakinessRate)
      .slice(0, 20);

    return json({
      flakyTests,
      totalFlaky: flakyTests.length,
    });
  } catch {
    return error("Failed to fetch flaky tests", 500);
  }
}
