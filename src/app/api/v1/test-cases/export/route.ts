export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";

export async function GET() {
  try {
    const testCases = await prisma.testCase.findMany({
      include: { steps: { orderBy: { position: "asc" } }, owner: true, project: true },
    });
    const data = testCases.map((tc) => ({
      key: tc.key,
      title: tc.title,
      description: tc.description,
      objective: tc.objective,
      preconditions: tc.preconditions,
      priority: tc.priority,
      severity: tc.severity,
      component: tc.component,
      status: tc.status,
      projectName: tc.project?.name,
      ownerName: tc.owner?.name,
      steps: tc.steps.map((s) => ({ action: s.action, expectedResult: s.expectedResult, data: s.data, position: s.position })),
    }));
    return json({ testCases: data });
  } catch {
    return error("Failed to export test cases", 500);
  }
}

export async function POST(req: Request) {
  try {
    const { testCases } = await req.json();
    if (!Array.isArray(testCases)) {
      return error("Invalid import format", 400);
    }

    const results = [];
    for (const tc of testCases) {
      if (!tc.key || !tc.title) continue;
      const created = await prisma.testCase.upsert({
        where: { key: tc.key },
        update: {
          title: tc.title,
          description: tc.description,
          objective: tc.objective,
          preconditions: tc.preconditions,
          priority: tc.priority,
          status: tc.status,
          component: tc.component,
        },
        create: {
          key: tc.key,
          title: tc.title,
          description: tc.description,
          objective: tc.objective,
          preconditions: tc.preconditions,
          priority: tc.priority,
          status: tc.status,
          component: tc.component,
          projectId: tc.projectId || "",
          ownerId: tc.ownerId || "",
        },
      });
      results.push(created);

      if (tc.steps && Array.isArray(tc.steps)) {
        for (const step of tc.steps) {
          await prisma.testStep.create({
            data: {
              testCaseId: created.id,
              action: step.action,
              expectedResult: step.expectedResult,
              data: step.data,
              position: step.position,
            },
          });
        }
      }
    }

    return json({ imported: results.length }, 201);
  } catch {
    return error("Failed to import test cases", 500);
  }
}
