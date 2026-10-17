import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { withAuth, requireTestCaseRole } from "@/lib/session";
import { pick } from "@/lib/api-auth";
import { sanitizeInput, FIELD_LIMITS } from "@/lib/validation";

const EDITABLE = [
  "title",
  "description",
  "objective",
  "preconditions",
  "testData",
  "testType",
  "testLevel",
  "testTechnique",
  "gherkinText",
  "priority",
  "severity",
  "status",
  "automationStatus",
  "automationScriptLink",
  "testEnvironment",
  "component",
  "labels",
  "reviewerId",
  "testSuiteId",
  "estimatedDuration",
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ testCaseId: string }> }
) {
  return withAuth(async (user) => {
    const { testCaseId } = await params;
    await requireTestCaseRole(user.id, testCaseId, "VIEWER");
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
      include: { steps: { orderBy: { position: "asc" } }, executions: true },
    });
    if (!testCase) return error("Test case not found", 404);
    return json(testCase);
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ testCaseId: string }> }
) {
  return withAuth(async (user) => {
    try {
      const { testCaseId } = await params;
      await requireTestCaseRole(user.id, testCaseId, "TESTER");
      const body = await req.json();
      const data = pick(body, EDITABLE);
      if (data.title && typeof data.title === "string") {
        data.title = sanitizeInput(data.title).slice(0, FIELD_LIMITS.title);
      }
      if (data.description && typeof data.description === "string") {
        data.description = sanitizeInput(data.description).slice(0, FIELD_LIMITS.description);
      }
      const testCase = await prisma.testCase.update({
        where: { id: testCaseId },
        data,
      });
      return json(testCase);
    } catch (err) {
      const status = (err as { status?: number })?.status ?? 500;
      const message = err instanceof Error ? err.message : "Failed to update test case";
      if (status >= 500) console.error("PATCH /test-cases/[testCaseId] error:", err);
      return error(message, status);
    }
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ testCaseId: string }> }
) {
  return withAuth(async (user) => {
    const { testCaseId } = await params;
    await requireTestCaseRole(user.id, testCaseId, "MANAGER");
    await prisma.testCase.delete({ where: { id: testCaseId } });
    return json({ ok: true });
  });
}