import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { generateContent, buildStrategyReviewPrompt } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { projectId, strategyName, currentApproach, painPoints } =
      await req.json();

    let projectName = "TestHub";
    if (projectId) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (project) projectName = project.name;
    }

    const prompt = buildStrategyReviewPrompt({
      projectName,
      strategyName: strategyName || "",
      currentApproach: currentApproach || "",
      painPoints: painPoints || undefined,
    });

    const text = await generateContent(
      [{ role: "user", parts: [{ text: prompt }] }],
      { temperature: 0.7, maxTokens: 3072 },
    );

    let review: unknown = {};
    try {
      review = JSON.parse(text);
    } catch {
      review = { raw: text };
    }

    return json({ review }, 201);
  } catch (err) {
    return error(err instanceof Error ? err.message : "Failed to review strategy", 500);
  }
}
