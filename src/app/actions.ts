"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sanitizeInput, FIELD_LIMITS } from "@/lib/validation";

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string;
  const org = await prisma.organisation.findFirst();
  await prisma.project.create({ data: { name: sanitizeInput(name), description: "", organisationId: org?.id || "" } });
  revalidatePath("/projects");
}

export async function createTestCase(formData: FormData) {
  const key = formData.get("key") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const objective = formData.get("objective") as string;
  const preconditions = formData.get("preconditions") as string;
  const testData = formData.get("testData") as string;
  const projectId = formData.get("projectId") as string;
  const ownerId = formData.get("ownerId") as string;
  const reviewerId = formData.get("reviewerId") as string || undefined;
  const testType = formData.get("testType") as string || undefined;
  const testLevel = formData.get("testLevel") as string || undefined;
  const testTechnique = formData.get("testTechnique") as string || undefined;
  const testEnvironment = formData.get("testEnvironment") as string || undefined;
  const priority = formData.get("priority") as string || "MEDIUM";
  const severity = formData.get("severity") as string || "MEDIUM";
  const status = formData.get("status") as string || "NOT_RUN";
  const automationStatus = formData.get("automationStatus") as string || "MANUAL";
  const automationScriptLink = formData.get("automationScriptLink") as string || undefined;
  const component = formData.get("component") as string || undefined;
  const estimatedDuration = formData.get("estimatedDuration") as string || undefined;
  const actualResult = formData.get("actualResult") as string || undefined;
  const requirementLinksRaw = formData.get("requirementLinks") as string || undefined;
  const labelsRaw = formData.get("labels") as string || undefined;

  // Steps as parallel arrays from FormData.getAll
  const stepActions = formData.getAll("stepActions") as string[];
  const stepExpectedResults = formData.getAll("stepExpectedResults") as string[];
  const stepData = formData.getAll("stepData") as string[];

  if (!title || !objective || !preconditions || !projectId || !ownerId) {
    throw new Error("Title, objective, preconditions, project and owner are required");
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new Error("Project not found");
  }

  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner) {
    throw new Error("Owner user not found");
  }

  if (reviewerId) {
    const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
    if (!reviewer) {
      throw new Error("Reviewer user not found");
    }
  }

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
    finalKey = sanitizeInput(key).toUpperCase().slice(0, FIELD_LIMITS.key);
    const existing = await prisma.testCase.findUnique({ where: { key: finalKey } });
    if (existing) {
      throw new Error(`Test case key "${finalKey}" already exists`);
    }
  }

  const labels: string[] | undefined = labelsRaw ? labelsRaw.split(",").map((s) => s.trim()).filter(Boolean) : undefined;

  const tc = await prisma.testCase.create({
    data: {
      key: finalKey,
      title: sanitizeInput(title).slice(0, FIELD_LIMITS.title),
      description: description ? sanitizeInput(description).slice(0, FIELD_LIMITS.description) : null,
      objective: sanitizeInput(objective).slice(0, FIELD_LIMITS.objective),
      preconditions: sanitizeInput(preconditions).slice(0, FIELD_LIMITS.preconditions),
      testData: testData ? sanitizeInput(testData).slice(0, FIELD_LIMITS.testData) : null,
      projectId,
      ownerId,
      reviewerId,
      testType,
      testLevel,
      testTechnique,
      testEnvironment,
      priority,
      severity,
      status,
      automationStatus,
      automationScriptLink,
      component,
      labels,
      estimatedDuration: estimatedDuration ? parseInt(estimatedDuration, 10) : null,
      actualResult: actualResult ? sanitizeInput(actualResult) : null,
      steps: {
        create: stepActions
          .filter((action, i) => action.trim().length > 0)
          .map((action, i) => ({
            action: sanitizeInput(action).slice(0, FIELD_LIMITS.description),
            expectedResult: sanitizeInput(stepExpectedResults[i] || "").slice(0, FIELD_LIMITS.description),
            data: stepData[i] ? sanitizeInput(stepData[i]) : null,
            position: i + 1,
          })),
      },
    },
  });

  // Link requirements if provided
  if (requirementLinksRaw) {
    const reqIds = requirementLinksRaw.split(",").map((s) => s.trim()).filter(Boolean);
    for (const reqId of reqIds) {
      const existingReq = await prisma.requirement.findUnique({ where: { key: reqId } });
      if (existingReq) {
        await prisma.requirementTestCase.create({
          data: { requirementId: existingReq.id, testCaseId: tc.id },
        }).catch(() => {}); // Ignore duplicates
      }
    }
  }

  revalidatePath("/test-cases");
}

export async function createTestPlan(formData: FormData) {
  const name = formData.get("name") as string;
  const projectId = formData.get("projectId") as string;
  await prisma.testPlan.create({ data: { name: sanitizeInput(name), description: "", projectId } });
  revalidatePath("/test-plans");
}

export async function createExecution(formData: FormData) {
  const testCaseId = formData.get("testCaseId") as string;
  const status = formData.get("status") as string;
  const testerId = formData.get("testerId") as string;
  await prisma.testExecution.create({ data: { testCaseId, status, testerId } });
  revalidatePath("/test-runs");
}

export async function createDefect(formData: FormData) {
  const title = formData.get("title") as string;
  const severity = formData.get("severity") as string;
  const reporterId = formData.get("reporterId") as string;
  const testCaseId = formData.get("testCaseId") as string || undefined;
  await prisma.defect.create({
    data: {
      title: sanitizeInput(title),
      severity,
      reporterId,
      testCaseId,
      status: "OPEN",
    },
  });
  revalidatePath("/defects");
}

export async function deleteTestCase(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.testCase.delete({ where: { id } });
  revalidatePath("/test-cases");
}

export async function addTestCaseToPlan(formData: FormData) {
  const testPlanId = formData.get("testPlanId") as string;
  const testCaseId = formData.get("testCaseId") as string;
  const suiteName = (formData.get("suiteName") as string) || "Default";
  const position = parseInt(formData.get("position") as string) || 0;

  if (!testPlanId || !testCaseId) {
    throw new Error("testPlanId and testCaseId are required");
  }

  let suite = await prisma.testSuite.findFirst({
    where: { testPlanId, name: suiteName },
  });
  if (!suite) {
    suite = await prisma.testSuite.create({
      data: { name: suiteName, testPlanId },
    });
  }

  await prisma.testPlanCase.create({
    data: { testSuiteId: suite.id, testCaseId, position },
  });
  revalidatePath(`/test-plans/${testPlanId}`);
}

export async function updateTestCase(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const objective = formData.get("objective") as string;
  const preconditions = formData.get("preconditions") as string;
  const priority = formData.get("priority") as string;
  const severity = formData.get("severity") as string;
  const status = formData.get("status") as string;
  const component = formData.get("component") as string;
  const testType = formData.get("testType") as string || undefined;
  const gherkinText = formData.get("gherkinText") as string || undefined;
  const projectId = formData.get("projectId") as string;
  const ownerId = formData.get("ownerId") as string;
  const changedById = formData.get("changedById") as string || undefined;

  if (!id || !title) {
    throw new Error("Title is required");
  }

  const existing = await prisma.testCase.findUnique({ where: { id } });
  if (existing) {
    const lastVersion = await prisma.testCaseVersion.findFirst({
      where: { testCaseId: id },
      orderBy: { version: "desc" },
    });
    await prisma.testCaseVersion.create({
      data: {
        testCaseId: id,
        version: (lastVersion?.version ?? 0) + 1,
        key: existing.key,
        title: existing.title,
        description: existing.description,
        objective: existing.objective,
        preconditions: existing.preconditions,
        priority: existing.priority,
        status: existing.status,
        component: existing.component,
        testType: existing.testType,
        gherkinText: existing.gherkinText,
        changedById,
      },
    });
  }

  await prisma.testCase.update({
    where: { id },
    data: {
      title: sanitizeInput(title).slice(0, FIELD_LIMITS.title),
      description: description ? sanitizeInput(description).slice(0, FIELD_LIMITS.description) : null,
      objective: objective ? sanitizeInput(objective).slice(0, FIELD_LIMITS.objective) : null,
      preconditions: preconditions ? sanitizeInput(preconditions).slice(0, FIELD_LIMITS.preconditions) : null,
      priority,
      severity,
      status,
      component: component ? sanitizeInput(component).slice(0, FIELD_LIMITS.component) : null,
      testType: testType ? sanitizeInput(testType) : null,
      gherkinText: gherkinText ? sanitizeInput(gherkinText) : null,
      projectId,
      ownerId,
    },
  });
  revalidatePath(`/test-cases/${id}`);
  revalidatePath("/test-cases");
}

export async function addTestStep(formData: FormData) {
  const testCaseId = formData.get("testCaseId") as string;
  const action = formData.get("action") as string;
  const expectedResult = formData.get("expectedResult") as string;
  const data = formData.get("data") as string;
  const position = parseInt(formData.get("position") as string) || 0;

  if (!testCaseId || !action || !expectedResult) {
    throw new Error("Action and expected result are required");
  }

  await prisma.testStep.create({
    data: {
      testCaseId,
      action: sanitizeInput(action).slice(0, FIELD_LIMITS.description),
      expectedResult: sanitizeInput(expectedResult).slice(0, FIELD_LIMITS.description),
      data: data ? sanitizeInput(data) : null,
      position,
    },
  });
  revalidatePath(`/test-cases/${testCaseId}`);
}

export async function updateTestStep(formData: FormData) {
  const id = formData.get("id") as string;
  const testCaseId = formData.get("testCaseId") as string;
  const action = formData.get("action") as string;
  const expectedResult = formData.get("expectedResult") as string;
  const data = formData.get("data") as string;
  const position = parseInt(formData.get("position") as string) || 0;

  if (!id) {
    throw new Error("Step id is required");
  }

  await prisma.testStep.update({
    where: { id },
    data: {
      action: sanitizeInput(action).slice(0, FIELD_LIMITS.description),
      expectedResult: sanitizeInput(expectedResult).slice(0, FIELD_LIMITS.description),
      data: data ? sanitizeInput(data) : null,
      position,
    },
  });
  revalidatePath(`/test-cases/${testCaseId}`);
}

export async function deleteTestStep(formData: FormData) {
  const id = formData.get("id") as string;
  const testCaseId = formData.get("testCaseId") as string;

  if (!id) {
    throw new Error("Step id is required");
  }

  await prisma.testStep.delete({ where: { id } });
  revalidatePath(`/test-cases/${testCaseId}`);
}

export async function updateStepResult(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const actualResult = formData.get("actualResult") as string;

  if (!id || !status) {
    throw new Error("Step result id and status are required");
  }

  await prisma.testStepResult.update({
    where: { id },
    data: { status, actualResult: actualResult || null },
  });
  revalidatePath("/test-runs");
}

export async function uploadAttachment(formData: FormData) {
  const file = formData.get("file") as File;
  const testCaseId = formData.get("testCaseId") as string || undefined;
  const uploadedById = formData.get("uploadedById") as string || undefined;

  if (!file) {
    throw new Error("No file provided");
  }
  if (!uploadedById) {
    throw new Error("uploadedById is required");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fs = await import("fs");
  const path = await import("path");
  const { randomUUID } = await import("crypto");

  const UPLOAD_DIR = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const filename = `${randomUUID()}-${file.name.replace(/\s+/g, "_")}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, buffer);

  await prisma.attachment.create({
    data: {
      filename,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: buffer.length,
      path: filePath,
      uploadedById,
      testCaseId: testCaseId ?? null,
    },
  });
  revalidatePath("/test-runs");
}

export async function bulkDeleteTestCases(formData: FormData) {
  const ids = formData.getAll("ids") as string[];
  if (ids.length === 0) {
    throw new Error("No test cases selected");
  }
  await prisma.testCase.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/test-cases");
}

export async function getUserSettings(userId: string) {
  if (!userId) {
    throw new Error("userId is required");
  }
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });
  if (!settings) {
    return await prisma.userSettings.create({
      data: { userId },
    });
  }
  return settings;
}

export async function saveUserSettings(formData: FormData) {
  const userId = formData.get("userId") as string;
  if (!userId) {
    throw new Error("userId is required");
  }

  const aiEnabled = formData.get("aiEnabled") === "true" || formData.get("aiEnabled") === "on";
  const autoComplete = (formData.get("autoComplete") as string) || "OFF";
  const confidenceThreshold = parseInt(formData.get("confidenceThreshold") as string) || 80;
  const retentionDays = parseInt(formData.get("retentionDays") as string) || 90;
  const minPassRate = parseInt(formData.get("minPassRate") as string) || 90;
  const blockOnCriticalFailures =
    formData.get("blockOnCriticalFailures") === "true" ||
    formData.get("blockOnCriticalFailures") === "on";
  const aiProvider = (formData.get("aiProvider") as string) || "gemini";
  const aiModel = (formData.get("aiModel") as string) || "gemini-flash-lite-latest";

  const integrationConfigs: Record<string, unknown> = {};
  const jiraEnabled = formData.get("jiraEnabled") === "true" || formData.get("jiraEnabled") === "on";
  if (jiraEnabled) {
    integrationConfigs.jira = {
      enabled: true,
      baseUrl: formData.get("jiraBaseUrl") as string || "",
      email: formData.get("jiraEmail") as string || "",
      apiToken: formData.get("jiraApiToken") as string || "",
      projectKey: formData.get("jiraProjectKey") as string || "",
    };
  }
  const azureEnabled = formData.get("azureEnabled") === "true" || formData.get("azureEnabled") === "on";
  if (azureEnabled) {
    integrationConfigs.azure = {
      enabled: true,
      pat: formData.get("azurePersonalToken") as string || "",
      organization: formData.get("azureOrg") as string || "",
      project: formData.get("azureProject") as string || "",
    };
  }
  const trelloEnabled = formData.get("trelloEnabled") === "true" || formData.get("trelloEnabled") === "on";
  if (trelloEnabled) {
    integrationConfigs.trello = {
      enabled: true,
      apiKey: formData.get("trelloToken") as string || "",
      token: formData.get("trelloToken") as string || "",
      boardId: formData.get("trelloBoardId") as string || "",
    };
  }

  await prisma.userSettings.upsert({
    where: { userId },
    update: {
      aiEnabled,
      autoComplete,
      confidenceThreshold,
      retentionDays,
      minPassRate,
      blockOnCriticalFailures,
      aiProvider,
      aiModel,
      integrationConfigs: Object.keys(integrationConfigs).length > 0 ? integrationConfigs as never : undefined,
    },
    create: {
      userId,
      aiEnabled,
      autoComplete,
      confidenceThreshold,
      retentionDays,
      minPassRate,
      blockOnCriticalFailures,
      aiProvider,
      aiModel,
      integrationConfigs: Object.keys(integrationConfigs).length > 0 ? integrationConfigs as never : undefined,
    },
  });

  revalidatePath("/settings");
}

export async function exportData(userId: string) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const [testCases, executions, defects, requirements, testPlans] = await Promise.all([
    prisma.testCase.findMany({
      include: {
        steps: true,
        project: true,
        owner: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.testExecution.findMany({
      include: { testCase: true, tester: { select: { id: true, email: true, name: true } } },
    }),
    prisma.defect.findMany({
      include: {
        reporter: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.requirement.findMany({
      include: {
        acceptanceCriteria: true,
        testCases: { include: { testCase: true } },
      },
    }),
    prisma.testPlan.findMany({
      include: { project: true },
    }),
  ]);

  return {
    testCases,
    executions,
    defects,
    requirements,
    testPlans,
    exportedAt: new Date().toISOString(),
  };
}

export async function deleteWorkspace(userId: string, projectId: string) {
  if (!userId || !projectId) {
    throw new Error("userId and projectId are required");
  }

  await prisma.$transaction(async (tx) => {
    const cases = await tx.testCase.findMany({
      where: { projectId },
      select: { id: true },
    });
    const caseIds = cases.map((c) => c.id);

    await tx.testStepResult.deleteMany({
      where: { testStep: { testCaseId: { in: caseIds } } },
    });
    await tx.testStep.deleteMany({
      where: { testCaseId: { in: caseIds } },
    });
    await tx.testPlanCase.deleteMany({
      where: { testCaseId: { in: caseIds } },
    });
    await tx.testCaseVersion.deleteMany({
      where: { testCaseId: { in: caseIds } },
    });
    await tx.testCase.deleteMany({
      where: { projectId },
    });

    await tx.testExecution.deleteMany({
      where: { testCase: { projectId } },
    });
    await tx.defect.deleteMany({
      where: {
        testCase: { projectId },
      },
    });
    await tx.testPlanCase.deleteMany({
      where: { testSuite: { testPlan: { projectId } } },
    });
    await tx.testSuite.deleteMany({
      where: { testPlan: { projectId } },
    });
    await tx.testPlan.deleteMany({
      where: { projectId },
    });

    await tx.attachment.deleteMany({
      where: { testCase: { projectId } },
    });
    await tx.requirementTestCase.deleteMany({
      where: { requirement: { projectId } },
    });
    await tx.requirementAcceptanceCriteria.deleteMany({
      where: { requirement: { projectId } },
    });
    await tx.requirement.deleteMany({
      where: { projectId },
    });

    await tx.project.delete({
      where: { id: projectId },
    });
  });

  revalidatePath("/projects");
}

export async function importAITestCase(formData: FormData) {
  const title = formData.get("title") as string;
  const objective = formData.get("objective") as string;
  const preconditions = formData.get("preconditions") as string;
  const priority = formData.get("priority") as string;
  const projectId = formData.get("projectId") as string;
  const ownerId = formData.get("ownerId") as string;
  const steps = formData.get("steps") as string;
  const testType = formData.get("testType") as string || undefined;
  const gherkinText = formData.get("gherkinText") as string || undefined;

  if (!title || !projectId || !ownerId) {
    throw new Error("Title, project and owner are required");
  }

  let parsedSteps: { action: string; expectedResult: string; data?: string }[] = [];
  try {
    parsedSteps = JSON.parse(steps);
  } catch {
    parsedSteps = [];
  }

  const maxKey = await prisma.testCase.findFirst({
    orderBy: { key: "desc" },
    select: { key: true },
  });
  const nextNum = maxKey ? parseInt(maxKey.key.split("-")[1] ?? "0") + 1 : 1;
  const key = `TC-AI-${nextNum}`;

  const tc = await prisma.testCase.create({
    data: {
      key,
      title,
      objective: objective || null,
      preconditions: preconditions || null,
      priority: priority || "MEDIUM",
      severity: priority || "MEDIUM",
      status: "DRAFT",
      testType: testType || null,
      gherkinText: gherkinText || null,
      projectId,
      ownerId,
      steps: {
        create: parsedSteps.map((s, i) => ({
          action: s.action,
          expectedResult: s.expectedResult,
          data: s.data || null,
          position: i + 1,
        })),
      },
    },
  });

  revalidatePath("/test-cases");
  revalidatePath(`/test-cases/${tc.id}`);
}

export async function createDefectWithTicket(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const severity = formData.get("severity") as string || "MEDIUM";
  const reporterId = formData.get("reporterId") as string;
  const testCaseId = formData.get("testCaseId") as string || undefined;
  const testExecutionId = formData.get("testExecutionId") as string || undefined;
  const assigneeId = formData.get("assigneeId") as string || undefined;
  const externalTicketId = formData.get("externalTicketId") as string || undefined;
  const externalTicketUrl = formData.get("externalTicketUrl") as string || undefined;

  if (!title || !reporterId) {
    throw new Error("Title and reporter are required");
  }

  await prisma.defect.create({
    data: {
      title: sanitizeInput(title).slice(0, FIELD_LIMITS.title),
      description: description ? sanitizeInput(description).slice(0, FIELD_LIMITS.description) : null,
      severity,
      reporterId,
      testCaseId: testCaseId || null,
      testExecutionId: testExecutionId || null,
      assigneeId: assigneeId || null,
      externalTicketId: externalTicketId ? sanitizeInput(externalTicketId).slice(0, 100) : null,
      externalTicketUrl: externalTicketUrl ? sanitizeInput(externalTicketUrl).slice(0, 500) : null,
    },
  });
  revalidatePath("/defects");
}

export async function updateDefect(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const severity = formData.get("severity") as string || "MEDIUM";
  const priority = formData.get("priority") as string || "MEDIUM";
  const status = formData.get("status") as string || "OPEN";
  const assigneeId = formData.get("assigneeId") as string || undefined;
  const externalTicketId = formData.get("externalTicketId") as string || undefined;
  const externalTicketUrl = formData.get("externalTicketUrl") as string || undefined;

  if (!id || !title) {
    throw new Error("Title is required");
  }

  await prisma.defect.update({
    where: { id },
    data: {
      title: sanitizeInput(title).slice(0, FIELD_LIMITS.title),
      description: description ? sanitizeInput(description).slice(0, FIELD_LIMITS.description) : null,
      severity,
      priority,
      status,
      assigneeId: assigneeId || null,
      externalTicketId: externalTicketId ? sanitizeInput(externalTicketId).slice(0, 100) : null,
      externalTicketUrl: externalTicketUrl ? sanitizeInput(externalTicketUrl).slice(0, 500) : null,
    },
  });
  revalidatePath(`/defects/${id}`);
  revalidatePath("/defects");
}

export async function uploadExecutionAttachment(formData: FormData) {
  const file = formData.get("file") as File;
  const testCaseId = formData.get("testCaseId") as string || undefined;
  const uploadedById = formData.get("uploadedById") as string;

  if (!file || !uploadedById) {
    throw new Error("File and uploadedById are required");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fs = await import("fs");
  const path = await import("path");
  const { randomUUID } = await import("crypto");

  const UPLOAD_DIR = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const filename = `${randomUUID()}-${file.name.replace(/\s+/g, "_")}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, buffer);

  await prisma.attachment.create({
    data: {
      filename,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: buffer.length,
      path: filePath,
      uploadedById,
      testCaseId: testCaseId ?? null,
    },
  });
  revalidatePath(`/test-cases/${testCaseId || ""}`);
}

export async function aiGenerateTestPlan(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const appUrl = formData.get("appUrl") as string;
  const codebase = formData.get("codebase") as string;
  const feature = formData.get("feature") as string;
  const requirements = formData.get("requirements") as string;

  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  const context = {
    projectName: project?.name || "TestHub",
    appUrl,
    codebase,
    feature: feature || "",
    requirements: requirements || "",
  };

  const prompt = `
You are an expert QA architect. Generate a comprehensive test plan for the following context.

Project: ${context.projectName}
Application URL: ${context.appUrl || "unknown"}
Codebase: ${context.codebase || "not provided"}
Feature: ${context.feature || "general"}
Requirements: ${context.requirements || "none specified"}

Generate a thorough test plan covering:
1. Test plan name and description
2. Scope and objectives
3. Test types needed (functional, API, UI, database, security, performance, accessibility)
4. Test scenarios with priority levels
5. Entry and exit criteria
6. Test environments

Return a JSON object with:
- name: test plan name
- description: test plan description
- scope: test plan scope
- objectives: test plan objectives
- scenarios: array of { title, description, priority, testType, preCondition, steps: [{ action, expectedResult }] }

Only return valid JSON, no markdown fences or extra text.
`;

  const { generateContent } = await import("@/lib/gemini");
  const text = await generateContent(
    [{ role: "user", parts: [{ text: prompt }] }],
    { temperature: 0.7, maxTokens: 4096 },
  );

  let draft: unknown = {};
  try {
    draft = JSON.parse(text);
  } catch {
    draft = { raw: text };
  }

  return draft;
}

export async function createEnvironment(formData: FormData) {
  "use server";
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  if (!projectId || !name) return;
  try {
    await prisma.environment.create({
      data: {
        projectId,
        name: name.trim(),
        description: (formData.get("description") as string)?.trim() || null,
        type: (formData.get("type") as string) || "QA",
        baseUrl: (formData.get("baseUrl") as string)?.trim() || null,
      },
    });
    revalidatePath("/environments");
  } catch {
    // swallow duplicates
  }
}

export async function createQualityGate(formData: FormData) {
  "use server";
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  if (!projectId || !name) return;
  try {
    await prisma.qualityGate.create({
      data: {
        projectId,
        name: name.trim(),
        description: (formData.get("description") as string)?.trim() || null,
        stage: (formData.get("stage") as string) || "SUBMIT",
        rules: JSON.stringify(
          (formData.get("rules") as string || "").split("\n").filter(Boolean)
        ),
        isBlocking: formData.get("isBlocking") === "on",
      },
    });
    revalidatePath("/quality-gates");
  } catch {
    // swallow duplicates
  }
}
