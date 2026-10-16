import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { sanitizeInput, validateKey, validateTitle, validatePriority, validateSeverity, validateStatus, validateTestType, validateTestLevel, validateAutomationStatus, validateTestEnvironment, FIELD_LIMITS } from "@/lib/validation";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
  const skip = (page - 1) * pageSize;

  const where = projectId ? { projectId } : {};

  const [items, total] = await Promise.all([
    prisma.testCase.findMany({
      skip,
      take: pageSize,
      where,
      include: { project: true, owner: true, reviewer: true, steps: { orderBy: { position: "asc" } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.testCase.count({ where }),
  ]);

  return paginated(items, page, pageSize, total);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      key,
      title,
      description,
      objective,
      preconditions,
      testData,
      priority,
      severity,
      status,
      automationStatus,
      testLevel,
      testTechnique,
      testEnvironment,
      component,
      labels,
      testType,
      gherkinText,
      projectId,
      ownerId,
      reviewerId,
      automationScriptLink,
      estimatedDuration,
      actualResult,
    } = body;

    // Required field validation
    if (!title || title.trim().length === 0) {
      return error("Test Case Title is required", 400);
    }
    if (!objective || objective.trim().length === 0) {
      return error("Objective / Description is required", 400);
    }
    if (!preconditions || preconditions.trim().length === 0) {
      return error("Preconditions are required", 400);
    }
    if (!projectId) {
      return error("Project is required - create a project before adding test cases", 400);
    }
    if (!ownerId) {
      return error("Owner is required", 400);
    }

    // Validate project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return error("Project not found", 404);
    }

    // Validate owner exists
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
      return error("Owner user not found", 404);
    }

    // Validate reviewer if provided
    if (reviewerId) {
      const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
      if (!reviewer) {
        return error("Reviewer user not found", 404);
      }
    }

    // Auto-generate key if not provided
    let finalKey = key;
    if (!finalKey || finalKey.trim().length === 0) {
      const projectPrefix = project.name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "TC";
      const lastCase = await prisma.testCase.findFirst({
        where: { projectId },
        orderBy: { key: "desc" },
        select: { key: true },
      });
      let nextNum = 1;
      if (lastCase?.key) {
        const match = lastCase.key.match(/(\d+)$/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      finalKey = `${projectPrefix}-${String(nextNum).padStart(3, "0")}`;
    } else {
      finalKey = sanitizeInput(String(finalKey)).toUpperCase();
      const keyValidation = validateKey(finalKey);
      if (!keyValidation.valid) {
        return error(keyValidation.error!, 400);
      }
      const existing = await prisma.testCase.findUnique({ where: { key: finalKey } });
      if (existing) {
        return error(`Test case key "${finalKey}" already exists`, 409);
      }
    }

    // Validate optional fields
    const titleValidation = validateTitle(title);
    if (!titleValidation.valid) {
      return error(titleValidation.error!, 400);
    }

    const priorityValidation = validatePriority(priority);
    if (!priorityValidation.valid) {
      return error(priorityValidation.error!, 400);
    }

    const severityValidation = validateSeverity(severity);
    if (!severityValidation.valid) {
      return error(severityValidation.error!, 400);
    }

    const statusValidation = validateStatus(status);
    if (!statusValidation.valid) {
      return error(statusValidation.error!, 400);
    }

    const testTypeValidation = validateTestType(testType);
    if (!testTypeValidation.valid) {
      return error(testTypeValidation.error!, 400);
    }

    const testLevelValidation = validateTestLevel(testLevel);
    if (!testLevelValidation.valid) {
      return error(testLevelValidation.error!, 400);
    }

    const automationStatusValidation = validateAutomationStatus(automationStatus);
    if (!automationStatusValidation.valid) {
      return error(automationStatusValidation.error!, 400);
    }

    const testEnvironmentValidation = validateTestEnvironment(testEnvironment);
    if (!testEnvironmentValidation.valid) {
      return error(testEnvironmentValidation.error!, 400);
    }

    const testCase = await prisma.testCase.create({
      data: {
        key: finalKey,
        title: sanitizeInput(String(title)).slice(0, FIELD_LIMITS.title),
        description: description ? sanitizeInput(String(description)).slice(0, FIELD_LIMITS.description) : null,
        objective: sanitizeInput(String(objective)).slice(0, FIELD_LIMITS.objective),
        preconditions: sanitizeInput(String(preconditions)).slice(0, FIELD_LIMITS.preconditions),
        testData: testData ? sanitizeInput(String(testData)).slice(0, FIELD_LIMITS.testData) : null,
        priority: priority || "MEDIUM",
        severity: severity || "MEDIUM",
        status: status || "NOT_RUN",
        automationStatus: automationStatus || "MANUAL",
        testLevel: testLevel || null,
        testTechnique: testTechnique ? sanitizeInput(String(testTechnique)) : null,
        testEnvironment: testEnvironment || null,
        component: component ? sanitizeInput(String(component)) : null,
        labels: Array.isArray(labels) ? labels : typeof labels === "string" ? [labels] : undefined,
        testType: testType || null,
        gherkinText: gherkinText ? sanitizeInput(String(gherkinText)) : null,
        projectId,
        ownerId,
        reviewerId: reviewerId || null,
        automationScriptLink: automationScriptLink ? sanitizeInput(String(automationScriptLink)) : null,
        estimatedDuration: estimatedDuration ? parseInt(String(estimatedDuration), 10) : null,
        actualResult: actualResult ? sanitizeInput(String(actualResult)) : null,
      },
      include: { project: true, owner: true, reviewer: true, steps: { orderBy: { position: "asc" } } },
    });
    return json(testCase, 201);
  } catch {
    return error("Failed to create test case", 500);
  }
}
