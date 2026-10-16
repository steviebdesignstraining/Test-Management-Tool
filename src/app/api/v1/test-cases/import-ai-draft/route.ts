import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";

export async function POST(req: Request) {
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

    if (!title || !projectId || !ownerId) {
      return error("Title, projectId and ownerId are required", 400);
    }

    let parsedSteps: { action: string; expectedResult: string; data?: string }[] = [];
    try {
      parsedSteps = JSON.parse(stepsRaw || "[]");
    } catch {
      parsedSteps = [];
    }

    const maxKey = await prisma.testCase.findFirst({
      orderBy: { key: "desc" },
      select: { key: true },
    });
    const nextNum = maxKey ? parseInt(maxKey.key.split("-")[1] ?? "0") + 1 : 1;
    const key = `TC-AI-${nextNum}`;

    const testCase = await prisma.testCase.create({
      data: {
        key,
        title,
        objective: objective || null,
        preconditions: preconditions || null,
        priority,
        severity: priority,
        status: "DRAFT",
        testType: testType || null,
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

    return json(testCase, 201);
  } catch {
    return error("Failed to import AI draft", 500);
  }
}
