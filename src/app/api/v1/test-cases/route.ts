export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { withAuth, requireProjectAccess } from "@/lib/session";
import { sanitizeInput, validateKey, validateTitle, validatePriority, validateSeverity, validateStatus, validateTestType, validateTestLevel, validateAutomationStatus, validateTestEnvironment, FIELD_LIMITS } from "@/lib/validation";

export async function GET(req: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const skip = (page - 1) * pageSize;

    if (!projectId) {
      return error("projectId query parameter is required", 400);
    }
    await requireProjectAccess(user.id, projectId);

    const where = { projectId };

    const [items, total] = await Promise.all([
      prisma.testCase.findMany({
        skip,
        take: pageSize,
        where,
        include: { project: true, owner: true, steps: { orderBy: { position: "asc" } } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.testCase.count({ where }),
    ]);

    return paginated(items, page, pageSize, total);
  });
}

export async function POST(req: Request) {
  return withAuth(async (user) => {
    try {
      const body = await req.json();

      const {
        key,
        title,
        description,
        objective,
        preconditions,
        testData,
        testType,
        testLevel,
        testTechnique,
        gherkinText,
        priority,
        severity,
        status,
        automationStatus,
        automationScriptLink,
        testEnvironment,
        component,
        labels,
        ownerId,
        reviewerId,
        projectId,
        testSuiteId,
        estimatedDuration,
      } = body;

      if (!title || !projectId || !ownerId) {
        return error("Title, projectId and ownerId are required", 400);
      }

      await requireProjectAccess(user.id, projectId);
      if (ownerId !== user.id) {
        await requireProjectAccess(ownerId, projectId);
      }
      if (reviewerId) {
        await requireProjectAccess(reviewerId, projectId);
      }

      const generatedKey = (key || title).toString().trim().toUpperCase().replace(/[^A-Z0-9]/g, "-") || "TC-NEW";
      const keyValidation = validateKey(generatedKey);
      if (!keyValidation.valid) {
        return error(keyValidation.error!, 400);
      }

      const existingKey = await prisma.testCase.findUnique({ where: { key: generatedKey } });
      if (existingKey) {
        return error(`Test case key "${generatedKey}" already exists`, 409);
      }

      const titleValidation = validateTitle(title);
      if (!titleValidation.valid) {
        return error(titleValidation.error!, 400);
      }

      const priorityVal = priority || "MEDIUM";
      const severityVal = severity || "MEDIUM";
      const statusVal = status || "DRAFT";
      const testTypeVal = testType || undefined;
      const testLevelVal = testLevel || undefined;
      const automationStatusVal = automationStatus || "MANUAL";
      const testEnvironmentVal = testEnvironment || undefined;

      if (priorityVal) {
        const v = validatePriority(priorityVal);
        if (!v.valid) return error(v.error!, 400);
      }
      if (severityVal) {
        const v = validateSeverity(severityVal);
        if (!v.valid) return error(v.error!, 400);
      }
      if (statusVal) {
        const v = validateStatus(statusVal);
        if (!v.valid) return error(v.error!, 400);
      }
      if (testTypeVal) {
        const v = validateTestType(testTypeVal);
        if (!v.valid) return error(v.error!, 400);
      }
      if (testLevelVal) {
        const v = validateTestLevel(testLevelVal);
        if (!v.valid) return error(v.error!, 400);
      }
      if (automationStatusVal) {
        const v = validateAutomationStatus(automationStatusVal);
        if (!v.valid) return error(v.error!, 400);
      }
      if (testEnvironmentVal) {
        const v = validateTestEnvironment(testEnvironmentVal);
        if (!v.valid) return error(v.error!, 400);
      }

      const testCase = await prisma.testCase.create({
        data: {
          key: generatedKey,
          title: sanitizeInput(String(title)).slice(0, FIELD_LIMITS.title),
          description: description ? sanitizeInput(String(description)).slice(0, FIELD_LIMITS.description) : null,
          objective: objective ? sanitizeInput(String(objective)).slice(0, FIELD_LIMITS.objective) : null,
          preconditions: preconditions ? sanitizeInput(String(preconditions)).slice(0, FIELD_LIMITS.preconditions) : null,
          testData: testData ? sanitizeInput(String(testData)).slice(0, FIELD_LIMITS.description) : null,
          testType: testTypeVal || null,
          testLevel: testLevelVal || null,
          testTechnique: testTechnique ? sanitizeInput(String(testTechnique)) : null,
          gherkinText: gherkinText ? sanitizeInput(String(gherkinText)).slice(0, FIELD_LIMITS.description) : null,
          priority: priorityVal,
          severity: severityVal,
          status: statusVal,
          automationStatus: automationStatusVal,
          automationScriptLink: automationScriptLink ? sanitizeInput(String(automationScriptLink)) : null,
          testEnvironment: testEnvironmentVal || null,
          component: component ? sanitizeInput(String(component)) : null,
          labels: Array.isArray(labels) ? labels.map((l: string) => sanitizeInput(String(l)).slice(0, 50)) : [],
          ownerId,
          reviewerId: reviewerId || null,
          projectId,
          testSuiteId: testSuiteId || null,
          estimatedDuration: estimatedDuration ? parseInt(String(estimatedDuration)) : null,
        },
      });

      return json(testCase, 201);
    } catch (err) {
      const status = (err as { status?: number })?.status ?? 500;
      const message = err instanceof Error ? err.message : "Failed to create test case";
      if (status >= 500) console.error("POST /test-cases error:", err);
      return error(message, status);
    }
  });
}
