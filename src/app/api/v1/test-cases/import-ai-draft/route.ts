import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { withAuth, requireProjectAccess } from "@/lib/session";
import { sanitizeInput, FIELD_LIMITS } from "@/lib/validation";

export async function POST(req: Request) {
  return withAuth(async (user) => {
    try {
      const formData = await req.formData();
      const title = formData.get("title") as string;
      const objective = formData.get("objective") as string || undefined;
      const preconditions = formData.get("preconditions") as string || undefined;
      const priority = (formData.get("priority") as string) || "MEDIUM";
      const projectId = formData.get("projectId") as string;
      const ownerId = formData.get("ownerId") as string;
      const testType = formData.get("testType") as string || undefined;
      const stepsRaw = formData.get("steps") as string;

      if (!title || !projectId) {
        return error("Title and projectId are required", 400);
      }

      await requireProjectAccess(user.id, projectId);

      const effectiveOwnerId = ownerId || user.id;
      if (effectiveOwnerId !== user.id) {
        await requireProjectAccess(effectiveOwnerId, projectId);
      }

      let parsedSteps: { action: string; expectedResult: string; data?: string }[] = [];
      try {
        parsedSteps = JSON.parse(stepsRaw || "[]").map((s: { action: string; expectedResult: string; data?: string }) => ({
          action: sanitizeInput(String(s.action ?? "")).slice(0, FIELD_LIMITS.description),
          expectedResult: sanitizeInput(String(s.expectedResult ?? "")).slice(0, FIELD_LIMITS.description),
          data: s.data ? sanitizeInput(String(s.data)) : undefined,
        }));
      } catch {
        parsedSteps = [];
      }

      const maxKey = await prisma.testCase.findFirst({
        where: { projectId },
        orderBy: { key: "desc" },
        select: { key: true },
      });
      const nextNum = maxKey ? parseInt(maxKey.key.split("-")[1] ?? "0") + 1 : 1;
      const key = `TC-AI-${nextNum}`;

      try {
        const testCase = await prisma.testCase.create({
          data: {
            key,
            title: sanitizeInput(title).slice(0, FIELD_LIMITS.title),
            objective: objective ? sanitizeInput(objective).slice(0, FIELD_LIMITS.objective) : null,
            preconditions: preconditions ? sanitizeInput(preconditions).slice(0, FIELD_LIMITS.preconditions) : null,
            priority,
            severity: priority,
            status: "DRAFT",
            testType: testType || null,
            projectId,
            ownerId: effectiveOwnerId,
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
        return json(testCase, 201);
      } catch (err: unknown) {
        if (err && typeof err === "object" && "code" in err && (err as { code?: string; meta?: { target?: string[] } }).code === "P2002") {
          const e = err as { meta?: { target?: string[] } };
          if (e.meta?.target?.includes("key")) {
            return error(`Test case key "${key}" is already used.`, 409);
          }
        }
        throw err;
      }
    } catch (err) {
      const status = (err as { status?: number })?.status ?? 500;
      const message = err instanceof Error ? err.message : "Failed to import AI draft";
      if (status >= 500) console.error("POST /test-cases/import-ai-draft error:", err);
      return error(message, status);
    }
  });
}