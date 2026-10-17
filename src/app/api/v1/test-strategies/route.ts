export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { sanitizeInput, FIELD_LIMITS } from "@/lib/validation";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
  const skip = (page - 1) * pageSize;

  const where = projectId ? { projectId } : {};

  const [items, total] = await Promise.all([
    prisma.testStrategy.findMany({
      skip,
      take: pageSize,
      where,
      include: { project: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.testStrategy.count({ where }),
  ]);

  return paginated(items, page, pageSize, total);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      projectId,
      version,
      status,
      purposeAndObjectives,
      scopeAndExclusions,
      testPrinciples,
      riskBasedApproach,
      testLevels,
      testTypes,
      testDesignTechniques,
      testEnvironmentApproach,
      testDataApproach,
      automationStrategy,
      manualTestingApproach,
      nonFunctionalTesting,
      aiTestingApproach,
      defectManagement,
      entryExitPrinciples,
      qualityMetrics,
      rolesAndResponsibilities,
      standardsAndCompliance,
      risksAssumptionsDependencies,
      approvalAndVersionHistory,
    } = body;

    if (!name || String(name).trim().length === 0) {
      return error("Strategy name is required", 400);
    }
    if (!projectId) {
      return error("Project is required", 400);
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return error("Project not found", 404);
    }

    const strategy = await prisma.testStrategy.create({
      data: {
        name: sanitizeInput(String(name)).slice(0, FIELD_LIMITS.title),
        projectId,
        version: version ? String(version) : "1.0",
        status: status || "DRAFT",
        purposeAndObjectives: purposeAndObjectives ? sanitizeInput(String(purposeAndObjectives)) : null,
        scopeAndExclusions: scopeAndExclusions ? sanitizeInput(String(scopeAndExclusions)) : null,
        testPrinciples: testPrinciples ? sanitizeInput(String(testPrinciples)) : null,
        riskBasedApproach: riskBasedApproach ? sanitizeInput(String(riskBasedApproach)) : null,
        testLevels: testLevels ? sanitizeInput(String(testLevels)) : null,
        testTypes: testTypes ? sanitizeInput(String(testTypes)) : null,
        testDesignTechniques: testDesignTechniques ? sanitizeInput(String(testDesignTechniques)) : null,
        testEnvironmentApproach: testEnvironmentApproach ? sanitizeInput(String(testEnvironmentApproach)) : null,
        testDataApproach: testDataApproach ? sanitizeInput(String(testDataApproach)) : null,
        automationStrategy: automationStrategy ? sanitizeInput(String(automationStrategy)) : null,
        manualTestingApproach: manualTestingApproach ? sanitizeInput(String(manualTestingApproach)) : null,
        nonFunctionalTesting: nonFunctionalTesting ? sanitizeInput(String(nonFunctionalTesting)) : null,
        aiTestingApproach: aiTestingApproach ? sanitizeInput(String(aiTestingApproach)) : null,
        defectManagement: defectManagement ? sanitizeInput(String(defectManagement)) : null,
        entryExitPrinciples: entryExitPrinciples ? sanitizeInput(String(entryExitPrinciples)) : null,
        qualityMetrics: qualityMetrics ? sanitizeInput(String(qualityMetrics)) : null,
        rolesAndResponsibilities: rolesAndResponsibilities ? sanitizeInput(String(rolesAndResponsibilities)) : null,
        standardsAndCompliance: standardsAndCompliance ? sanitizeInput(String(standardsAndCompliance)) : null,
        risksAssumptionsDependencies: risksAssumptionsDependencies ? sanitizeInput(String(risksAssumptionsDependencies)) : null,
        approvalAndVersionHistory: approvalAndVersionHistory ? sanitizeInput(String(approvalAndVersionHistory)) : null,
      },
      include: { project: true },
    });
    return json(strategy, 201);
  } catch {
    return error("Failed to create test strategy", 500);
  }
}
