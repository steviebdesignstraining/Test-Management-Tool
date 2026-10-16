import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  makeMockRequest,
  parseResponse,
  getPagination,
  createTestProjectWithUser,
  createTestTestCase,
  generateTestEmail,
  cleanupTestData,
} from "./helpers";

import { GET as projectsGET, POST as projectsPOST } from "@/app/api/v1/projects/route";
import { GET as testCasesGET, POST as testCasesPOST } from "@/app/api/v1/test-cases/route";
import {
  GET as testCaseByIdGET,
  PATCH as testCaseByIdPATCH,
  DELETE as testCaseByIdDELETE,
} from "@/app/api/v1/test-cases/[testCaseId]/route";
import { GET as testStepsGET, POST as testStepsPOST } from "@/app/api/v1/test-cases/[testCaseId]/steps/route";
import {
  GET as testRunsGET,
  POST as testRunsPOST,
} from "@/app/api/v1/test-runs/route";
import {
  GET as testExecutionsGET,
  POST as testExecutionsPOST,
} from "@/app/api/v1/test-executions/route";
import {
  GET as defectsGET,
  POST as defectsPOST,
} from "@/app/api/v1/defects/route";
import {
  GET as defectByIdGET,
  PATCH as defectByIdPATCH,
} from "@/app/api/v1/defects/[defectId]/route";
import {
  GET as attachmentsGET,
  POST as attachmentsPOST,
} from "@/app/api/v1/attachments/route";
import {
  GET as attachmentByIdGET,
  DELETE as attachmentByIdDELETE,
} from "@/app/api/v1/attachments/[id]/route";
import { GET as analyticsOverviewGET } from "@/app/api/v1/analytics/overview/route";
import { GET as analyticsCoverageGET } from "@/app/api/v1/analytics/coverage/route";
import { GET as analyticsTrendsGET } from "@/app/api/v1/analytics/trends/route";
import { GET as analyticsFlakyGET } from "@/app/api/v1/analytics/flaky-tests/route";
import { POST as registerPOST } from "@/app/api/v1/auth/register/route";
import { POST as loginPOST } from "@/app/api/v1/auth/login/route";
import { json } from "@/lib/api-response";

vi.mock("next/headers", () => ({
  cookies: () => ({
    get: () => undefined,
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    rateLimit: () => ({ allowed: true, remaining: 999, resetAt: Date.now() + 60000 }),
    createSession: vi.fn().mockResolvedValue("test-session-token"),
    auditLog: vi.fn().mockResolvedValue(undefined),
  };
});

describe("API Contract Tests", () => {
  let testContext: {
    org: { id: string };
    project: { id: string };
    user: { id: string; email: string };
    testCase?: { id: string; key: string };
  };

  beforeAll(async () => {
    await cleanupTestData();
    testContext = await createTestProjectWithUser();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe("Auth API", () => {
    describe("register", () => {
      it("registers a new user with valid credentials", async () => {
        const email = generateTestEmail();
        const res = await registerPOST(
          makeMockRequest("http://localhost:3001/api/v1/auth/register", {
            email,
            password: "ValidPass123!",
            name: "Test User",
          }),
        );
        const { status, body } = await parseResponse(res);
        expect(status).toBe(201);
        const result = body as { user: { email: string }; sessionToken: string };
        expect(result.user).toHaveProperty("email", email);
        expect(result.sessionToken).toBeDefined();
      });

      it("returns 400 when email is missing", async () => {
        const res = await registerPOST(
          makeMockRequest("http://localhost:3001/api/v1/auth/register", {
            password: "ValidPass123!",
          }),
        );
        const { status, body } = await parseResponse(res);
        expect(status).toBe(400);
        expect((body as { error?: string }).error).toContain("required");
      });

      it("returns 400 when password is missing", async () => {
        const res = await registerPOST(
          makeMockRequest("http://localhost:3001/api/v1/auth/register", {
            email: generateTestEmail(),
          }),
        );
        const { status, body } = await parseResponse(res);
        expect(status).toBe(400);
        expect((body as { error?: string }).error).toContain("required");
      });

      it("returns 409 when email already exists", async () => {
        const email = generateTestEmail();
        await registerPOST(
          makeMockRequest("http://localhost:3001/api/v1/auth/register", {
            email,
            password: "ValidPass123!",
          }),
        );
        const res = await registerPOST(
          makeMockRequest("http://localhost:3001/api/v1/auth/register", {
            email,
            password: "ValidPass123!",
          }),
        );
        const { status } = await parseResponse(res);
        expect(status).toBe(409);
      });
    });

    describe("login", () => {
      it("returns 400 when credentials are missing", async () => {
        const res = await loginPOST(
          makeMockRequest("http://localhost:3001/api/v1/auth/login", {}),
        );
        const { status, body } = await parseResponse(res);
        expect(status).toBe(400);
        expect((body as { error?: string }).error).toContain("required");
      });

      it("returns 401 for non-existent user", async () => {
        const res = await loginPOST(
          makeMockRequest("http://localhost:3001/api/v1/auth/login", {
            email: "nonexistent@example.com",
            password: "password",
          }),
        );
        const { status, body } = await parseResponse(res);
        expect(status).toBe(401);
        expect((body as { error?: string }).error).toBe("Invalid email or password.");
      });
    });
  });

  describe("Projects API", () => {
    it("returns 400 when creating project without name", async () => {
      const res = await projectsPOST(
        makeMockRequest("http://localhost:3001/api/v1/projects", {}),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect((body as { error?: string }).error).toContain("required");
    });

    it("creates a project with valid data", async () => {
      const org = await prisma.organisation.create({
        data: { name: "Project Test Org" },
      });
      const res = await projectsPOST(
        makeMockRequest("http://localhost:3001/api/v1/projects", {
          name: "Test Project Creation",
          organisationId: org.id,
        }),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(201);
      expect((body as { id: string }).id).toBeDefined();
      await prisma.project.deleteMany({ where: { name: "Test Project Creation" } });
      await prisma.organisation.delete({ where: { id: org.id } });
    });

    it("lists projects with pagination", async () => {
      const res = await projectsGET(
        makeMockRequest("http://localhost:3001/api/v1/projects?page=1&pageSize=10"),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      const paginated = await getPagination(body);
      expect(paginated).toHaveProperty("items");
      expect(paginated).toHaveProperty("total");
    });
  });

  describe("Test Cases API", () => {
    it("creates a test case with required fields", async () => {
      const res = await testCasesPOST(
        makeMockRequest("http://localhost:3001/api/v1/test-cases", {
          key: `TC-CREATE-${Date.now()}`,
          title: "API Contract Test Case",
          projectId: testContext.project.id,
          ownerId: testContext.user.id,
        }),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(201);
      expect((body as { id: string }).id).toBeDefined();
      expect((body as { title: string }).title).toBe("API Contract Test Case");
    });

    it("returns 400 when title is missing", async () => {
      const res = await testCasesPOST(
        makeMockRequest("http://localhost:3001/api/v1/test-cases", {
          projectId: testContext.project.id,
          ownerId: testContext.user.id,
        }),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect((body as { error?: string }).error).toContain("required");
    });

    it("returns 400 when projectId is missing", async () => {
      const res = await testCasesPOST(
        makeMockRequest("http://localhost:3001/api/v1/test-cases", {
          key: "TC-MISSING-PROJ",
          title: "Missing Project Case",
          ownerId: testContext.user.id,
        }),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect((body as { error?: string }).error).toContain("required");
    });

    it("returns 400 when ownerId is missing", async () => {
      const res = await testCasesPOST(
        makeMockRequest("http://localhost:3001/api/v1/test-cases", {
          key: "TC-MISSING-OWNER",
          title: "Missing Owner Case",
          projectId: testContext.project.id,
        }),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect((body as { error?: string }).error).toContain("required");
    });

    it("creates a test case with testType and gherkinText", async () => {
      const res = await testCasesPOST(
        makeMockRequest("http://localhost:3001/api/v1/test-cases", {
          key: `TC-TYPED-${Date.now()}`,
          title: "Gherkin Test Case",
          projectId: testContext.project.id,
          ownerId: testContext.user.id,
          testType: "GHERKIN",
          gherkinText: "Feature: Login\n  Scenario: Valid user logs in",
        }),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(201);
      expect((body as { testType: string }).testType).toBe("GHERKIN");
      expect((body as { gherkinText: string }).gherkinText).toContain("Feature: Login");
    });

    it("lists test cases with pagination", async () => {
      const res = await testCasesGET(
        makeMockRequest("http://localhost:3001/api/v1/test-cases?page=1&pageSize=10"),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      const paginated = await getPagination(body);
      expect(Array.isArray(paginated.items)).toBe(true);
    });

    it("filters test cases by project", async () => {
      const res = await testCasesGET(
        makeMockRequest(
          `http://localhost:3001/api/v1/test-cases?projectId=${testContext.project.id}`,
        ),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      const paginated = await getPagination(body);
      expect(paginated.items.length).toBeGreaterThanOrEqual(0);
    });

    it("returns 404 for non-existent test case", async () => {
      const res = await testCaseByIdGET(
        makeMockRequest("http://localhost:3001/api/v1/test-cases/non-existent-id"),
        { params: Promise.resolve({ testCaseId: "non-existent-id" }) },
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(404);
    });

    it("updates a test case", async () => {
      const tc = await createTestTestCase(
        testContext.project.id,
        testContext.user.id,
      );
      const res = await testCaseByIdPATCH(
        makeMockRequest(
          `http://localhost:3001/api/v1/test-cases/${tc.id}`,
          { title: "Updated Title", priority: "HIGH" },
          { method: "PATCH" },
        ),
        { params: Promise.resolve({ testCaseId: tc.id }) },
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect((body as { title: string }).title).toBe("Updated Title");
      expect((body as { priority: string }).priority).toBe("HIGH");
    });

    it("deletes a test case", async () => {
      const tc = await createTestTestCase(
        testContext.project.id,
        testContext.user.id,
      );
      const res = await testCaseByIdDELETE(
        makeMockRequest(
          `http://localhost:3001/api/v1/test-cases/${tc.id}`,
          undefined,
          { method: "DELETE" },
        ),
        { params: Promise.resolve({ testCaseId: tc.id }) },
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect((body as { ok: boolean }).ok).toBe(true);
    });
  });

  describe("Test Steps API", () => {
    it("creates a test step", async () => {
      const tc = await createTestTestCase(
        testContext.project.id,
        testContext.user.id,
      );
      const res = await testStepsPOST(
        makeMockRequest(
          `http://localhost:3001/api/v1/test-cases/${tc.id}/steps`,
          {
            action: "Click login button",
            expectedResult: "Dashboard is displayed",
            position: 1,
          },
        ),
        { params: Promise.resolve({ testCaseId: tc.id }) },
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(201);
      expect((body as { id: string }).id).toBeDefined();
      expect((body as { action: string }).action).toBe("Click login button");
    });

    it("lists test steps for a test case", async () => {
      const tc = await createTestTestCase(
        testContext.project.id,
        testContext.user.id,
      );
      const res = await testStepsGET(
        makeMockRequest(
          `http://localhost:3001/api/v1/test-cases/${tc.id}/steps`,
        ),
        { params: Promise.resolve({ testCaseId: tc.id }) },
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe("Test Executions API", () => {
    it("creates a test execution with required fields", async () => {
      const tc = await createTestTestCase(
        testContext.project.id,
        testContext.user.id,
      );
      const res = await testExecutionsPOST(
        makeMockRequest("http://localhost:3001/api/v1/test-executions", {
          testCaseId: tc.id,
          testerId: testContext.user.id,
          status: "PASSED",
        }),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(201);
      expect((body as { id: string }).id).toBeDefined();
      expect((body as { status: string }).status).toBe("PASSED");
    });

    it("returns 400 when testCaseId is missing", async () => {
      const res = await testExecutionsPOST(
        makeMockRequest("http://localhost:3001/api/v1/test-executions", {
          testerId: testContext.user.id,
          status: "PASSED",
        }),
      );
      const { status } = await parseResponse(res);
      expect(status).toBe(400);
    });

    it("returns 400 when testerId is missing", async () => {
      const tc = await createTestTestCase(
        testContext.project.id,
        testContext.user.id,
      );
      const res = await testExecutionsPOST(
        makeMockRequest("http://localhost:3001/api/v1/test-executions", {
          testCaseId: tc.id,
          status: "PASSED",
        }),
      );
      const { status } = await parseResponse(res);
      expect(status).toBe(400);
    });

    it("lists test executions with pagination", async () => {
      const res = await testExecutionsGET(
        makeMockRequest("http://localhost:3001/api/v1/test-executions?page=1&pageSize=10"),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      const paginated = await getPagination(body);
      expect(Array.isArray(paginated.items)).toBe(true);
    });

    it("filters test executions by testCaseId", async () => {
      const tc = await createTestTestCase(
        testContext.project.id,
        testContext.user.id,
      );
      await testExecutionsPOST(
        makeMockRequest("http://localhost:3001/api/v1/test-executions", {
          testCaseId: tc.id,
          testerId: testContext.user.id,
          status: "FAILED",
        }),
      );
      const res = await testExecutionsGET(
        makeMockRequest(
          `http://localhost:3001/api/v1/test-executions?testCaseId=${tc.id}`,
        ),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      const paginated = await getPagination(body);
      expect(paginated.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Defects API", () => {
    it("creates a defect with required fields", async () => {
      const tc = await createTestTestCase(
        testContext.project.id,
        testContext.user.id,
      );
      const res = await defectsPOST(
        makeMockRequest("http://localhost:3001/api/v1/defects", {
          title: "API Contract Defect",
          description: "A defect created by API contract test",
          testCaseId: tc.id,
          reporterId: testContext.user.id,
          severity: "HIGH",
          priority: "MEDIUM",
        }),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(201);
      expect((body as { id: string }).id).toBeDefined();
      expect((body as { title: string }).title).toBe("API Contract Defect");
    });

    it("returns 400 when title is missing", async () => {
      const res = await defectsPOST(
        makeMockRequest("http://localhost:3001/api/v1/defects", {
          reporterId: testContext.user.id,
        }),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect((body as { error?: string }).error).toContain("required");
    });

    it("returns 400 when reporterId is missing", async () => {
      const res = await defectsPOST(
        makeMockRequest("http://localhost:3001/api/v1/defects", {
          title: "Missing Reporter Defect",
        }),
      );
      const { status } = await parseResponse(res);
      expect(status).toBe(400);
    });

    it("creates a defect with external ticket info", async () => {
      const tc = await createTestTestCase(
        testContext.project.id,
        testContext.user.id,
      );
      const res = await defectsPOST(
        makeMockRequest("http://localhost:3001/api/v1/defects", {
          title: "External Ticket Defect",
          reporterId: testContext.user.id,
          severity: "CRITICAL",
          externalTicketId: "JIRA-123",
          externalTicketUrl: "https://company.atlassian.net/browse/JIRA-123",
        }),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(201);
      expect((body as { externalTicketId: string }).externalTicketId).toBe("JIRA-123");
      expect((body as { externalTicketUrl: string }).externalTicketUrl).toContain("atlassian.net");
    });

    it("lists defects with pagination", async () => {
      const res = await defectsGET(
        makeMockRequest("http://localhost:3001/api/v1/defects?page=1&pageSize=10"),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      const paginated = await getPagination(body);
      expect(Array.isArray(paginated.items)).toBe(true);
    });

    it("returns 404 for non-existent defect", async () => {
      const res = await defectByIdGET(
        makeMockRequest("http://localhost:3001/api/v1/defects/non-existent-id"),
        { params: Promise.resolve({ defectId: "non-existent-id" }) },
      );
      const { status } = await parseResponse(res);
      expect(status).toBe(404);
    });

    it("updates a defect", async () => {
      const tc = await createTestTestCase(
        testContext.project.id,
        testContext.user.id,
      );
      const def = await prisma.defect.create({
        data: {
          title: "Defect to Update",
          reporterId: testContext.user.id,
          testCaseId: tc.id,
          severity: "LOW",
        },
      });
      const res = await defectByIdPATCH(
        makeMockRequest(
          `http://localhost:3001/api/v1/defects/${def.id}`,
          { status: "RESOLVED", severity: "MEDIUM" },
          { method: "PATCH" },
        ),
        { params: Promise.resolve({ defectId: def.id }) },
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect((body as { status: string }).status).toBe("RESOLVED");
      expect((body as { severity: string }).severity).toBe("MEDIUM");
    });

    it("filters defects by projectId", async () => {
      const org = await prisma.organisation.create({ data: { name: "Defect Filter Org" } });
      const project = await prisma.project.create({
        data: { name: "Defect Filter Proj", organisationId: org.id },
      });
      const otherProject = await prisma.project.create({
        data: { name: "Other Proj", organisationId: org.id },
      });
      const tc1 = await createTestTestCase(project.id, testContext.user.id, { key: "TC-FILTER-1" });
      const tc2 = await createTestTestCase(otherProject.id, testContext.user.id, { key: "TC-FILTER-2" });
      await prisma.defect.create({
        data: { title: "Defect in P1", reporterId: testContext.user.id, testCaseId: tc1.id },
      });
      await prisma.defect.create({
        data: { title: "Defect in P2", reporterId: testContext.user.id, testCaseId: tc2.id },
      });

      const res = await defectsGET(
        makeMockRequest(`http://localhost:3001/api/v1/defects?projectId=${project.id}`),
      );
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      const paginated = await getPagination(body);
      const titles = (paginated.items as { title: string }[]).map((i) => i.title);
      expect(titles).toContain("Defect in P1");
      expect(titles).not.toContain("Defect in P2");

      await prisma.defect.deleteMany({ where: { testCaseId: { in: [tc1.id, tc2.id] } } });
      await prisma.testCase.deleteMany({ where: { id: { in: [tc1.id, tc2.id] } } });
      await prisma.project.deleteMany({ where: { id: { in: [project.id, otherProject.id] } } });
      await prisma.organisation.delete({ where: { id: org.id } });
    });
  });

  describe("Attachments API", () => {
    it("returns 400 when no file is provided", async () => {
      const formData = new FormData();
      formData.append("uploadedById", testContext.user.id);
      const req = new Request("http://localhost:3001/api/v1/attachments", {
        method: "POST",
        body: formData,
      });
      const res = await attachmentsPOST(req);
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect((body as { error?: string }).error).toContain("file");
    });

    it("returns 400 when uploadedById is missing", async () => {
      const formData = new FormData();
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      formData.append("file", file);
      const req = new Request("http://localhost:3001/api/v1/attachments", {
        method: "POST",
        body: formData,
      });
      const res = await attachmentsPOST(req);
      const { status, body } = await parseResponse(res);
      expect(status).toBe(400);
      expect((body as { error?: string }).error).toContain("uploadedById");
    });

    it("lists attachments", async () => {
      const res = await attachmentsGET();
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    it("returns 404 for non-existent attachment", async () => {
      const res = await attachmentByIdGET(
        makeMockRequest("http://localhost:3001/api/v1/attachments/non-existent"),
        { params: Promise.resolve({ id: "non-existent" }) },
      );
      const { status } = await parseResponse(res);
      expect(status).toBe(404);
    });

    it("returns 404 when deleting non-existent attachment", async () => {
      const res = await attachmentByIdDELETE(
        makeMockRequest("http://localhost:3001/api/v1/attachments/non-existent", undefined, { method: "DELETE" }),
        { params: Promise.resolve({ id: "non-existent" }) },
      );
      const { status } = await parseResponse(res);
      expect(status).toBe(404);
    });
  });

  describe("Analytics API", () => {
    it("returns analytics overview object", async () => {
      const res = await analyticsOverviewGET();
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(body).toHaveProperty("manualPassRate");
      expect(body).toHaveProperty("automationPassRate");
      expect(body).toHaveProperty("testCoverage");
      expect(body).toHaveProperty("automationMappingCoverage");
      expect(body).toHaveProperty("flakyRate");
    });

    it("returns array for coverage analytics", async () => {
      const res = await analyticsCoverageGET();
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    it("returns array for trends analytics", async () => {
      const res = await analyticsTrendsGET();
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });

    it("returns array for flaky-tests analytics", async () => {
      const res = await analyticsFlakyGET();
      const { status, body } = await parseResponse(res);
      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe("Database relationship integrity", () => {
    it("enforces foreign key on test case -> project", async () => {
      await expect(
        prisma.testCase.create({
          data: {
            key: "TC-FK-FAIL",
            title: "Should fail",
            projectId: "non-existent-project",
            ownerId: testContext.user.id,
          },
        }),
      ).rejects.toThrow();
    });

    it("enforces foreign key on test case -> owner", async () => {
      await expect(
        prisma.testCase.create({
          data: {
            key: "TC-FK-FAIL-2",
            title: "Should fail",
            projectId: testContext.project.id,
            ownerId: "non-existent-user",
          },
        }),
      ).rejects.toThrow();
    });

    it("enforces foreign key on defect -> testCase", async () => {
      await expect(
        prisma.defect.create({
          data: {
            title: "FK Test Defect",
            reporterId: testContext.user.id,
            testCaseId: "non-existent-test-case",
          },
        }),
      ).rejects.toThrow();
    });

    it("enforces foreign key on defect -> reporter", async () => {
      const tc = await createTestTestCase(
        testContext.project.id,
        testContext.user.id,
        { key: "TC-DEFECT-REPORT-1" },
      );
      await expect(
        prisma.defect.create({
          data: {
            title: "FK Test Defect 2",
            reporterId: "non-existent-user",
            testCaseId: tc.id,
          },
        }),
      ).rejects.toThrow();
    });

    it("enforces unique constraint on test case key", async () => {
      const key = `TC-UNIQUE-${Date.now()}`;
      await createTestTestCase(testContext.project.id, testContext.user.id, { key });
      await expect(
        prisma.testCase.create({
          data: { key, title: "Duplicate", projectId: testContext.project.id, ownerId: testContext.user.id },
        }),
      ).rejects.toThrow();
    });

    it("enforces unique constraint on organisation member (user + org)", async () => {
      const org = await prisma.organisation.create({ data: { name: "Duplicate Member Org" } });
      await prisma.organisationMember.create({
        data: { userId: testContext.user.id, organisationId: org.id },
      });
      await expect(
        prisma.organisationMember.create({
          data: { userId: testContext.user.id, organisationId: org.id },
        }),
      ).rejects.toThrow();
      await prisma.organisationMember.deleteMany({ where: { organisationId: org.id } });
      await prisma.organisation.delete({ where: { id: org.id } });
    });
  });
});
