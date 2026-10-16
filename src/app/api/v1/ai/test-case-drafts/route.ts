import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { generateContent, buildTestCaseDraftPrompt } from "@/lib/gemini";
import { sanitizeInput, FIELD_LIMITS } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const { projectId, feature, acceptanceCriteria } = await req.json();

    const cleanFeature = feature ? sanitizeInput(String(feature)).slice(0, FIELD_LIMITS.description) : "";
    const cleanCriteria = acceptanceCriteria ? sanitizeInput(String(acceptanceCriteria)).slice(0, FIELD_LIMITS.description) : undefined;

    let projectName = "TestHub";
    let existingCases = "";
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (project) projectName = project.name;

      const cases = await prisma.testCase.findMany({
        where: { projectId },
        take: 10,
      });
      existingCases = cases.map((c) => `- ${c.key}: ${c.title}`).join("\n");
    }

    const prompt = buildTestCaseDraftPrompt({
      projectName,
      feature: cleanFeature,
      acceptanceCriteria: cleanCriteria,
      existingCases: existingCases || undefined,
    });

    const text = await generateContent(
      [{ role: "user", parts: [{ text: prompt }] }],
      { temperature: 0.7, maxTokens: 3072 },
    );

    let draft: unknown = {};
    try {
      draft = JSON.parse(text);
    } catch {
      draft = { raw: text };
    }

    return json({ draft }, 201);
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Failed to generate test case draft",
      500,
    );
  }
}
