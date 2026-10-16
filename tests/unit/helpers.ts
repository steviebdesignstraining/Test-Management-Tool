import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export function makeMockRequest(
  url: string,
  body?: unknown,
  init?: RequestInit,
): Request {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  return new Request(url, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  });
}

export function makeMockRequestRaw(
  url: string,
  options: RequestInit = {},
): Request {
  return new Request(url, options);
}

export async function parseResponse(res: Response): Promise<{
  status: number;
  body: unknown;
}> {
  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  return { status: res.status, body };
}

export async function getPagination(responseBody: unknown): Promise<{
  items: unknown[];
  total: number;
  page: number;
  pageSize: number;
}> {
  if (Array.isArray(responseBody)) {
    return { items: responseBody, total: responseBody.length, page: 1, pageSize: 20 };
  }
  const paginated = responseBody as {
    items?: unknown[];
    total?: number;
    page?: number;
    pageSize?: number;
  };
  return {
    items: paginated.items ?? [],
    total: paginated.total ?? 0,
    page: paginated.page ?? 1,
    pageSize: paginated.pageSize ?? 20,
  };
}

export function generateTestEmail(): string {
  return `test-${randomUUID().slice(0, 8)}@example.com`;
}

export async function createTestOrganisation(name?: string) {
  return prisma.organisation.create({
    data: {
      name: name || `Test Org ${randomUUID().slice(0, 8)}`,
    },
  });
}

export async function createTestProject(orgId: string, name?: string) {
  return prisma.project.create({
    data: {
      name: name || `Project ${randomUUID().slice(0, 8)}`,
      organisationId: orgId,
    },
  });
}

export async function createTestUser(email?: string) {
  const bcrypt = await import("bcryptjs");
  return prisma.user.create({
    data: {
      email: email || generateTestEmail(),
      name: "Test User",
      passwordHash: await bcrypt.hash("testpass123", 12),
    },
  });
}

export async function createTestProjectWithUser() {
  const org = await createTestOrganisation();
  const project = await createTestProject(org.id);
  const user = await createTestUser();
  return { org, project, user };
}

export async function createTestTestCase(
  projectId: string,
  ownerId: string,
  overrides: Record<string, unknown> = {},
) {
  const key = `TC-CONTRACT-${randomUUID().slice(0, 8)}`;
  return prisma.testCase.create({
    data: {
      key,
      title: "Contract Test Case",
      priority: "MEDIUM",
      status: "DRAFT",
      projectId,
      ownerId,
      ...overrides,
    },
  });
}

export async function cleanupTestData() {
  await prisma.auditLog.deleteMany({});
  await prisma.testStepResult.deleteMany({});
  await prisma.testStep.deleteMany({});
  await prisma.testExecution.deleteMany({});
  await prisma.defect.deleteMany({
    where: {
      status: { in: ["OPEN", "RESOLVED", "CLOSED", "IN_PROGRESS"] },
    },
  });
  await prisma.testCaseVersion.deleteMany({});
  await prisma.requirementTestCase.deleteMany({});
  await prisma.requirementAcceptanceCriteria.deleteMany({});
  await prisma.requirement.deleteMany({});
  await prisma.testPlanCase.deleteMany({});
  await prisma.testSuite.deleteMany({});
  await prisma.testPlan.deleteMany({});
  await prisma.testCase.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.organisationMember.deleteMany({});
  await prisma.organisation.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  await prisma.userSettings.deleteMany({});
  await prisma.user.deleteMany({
    where: { email: { endsWith: "@example.com" } },
  });
}
