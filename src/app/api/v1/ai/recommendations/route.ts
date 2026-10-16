import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { generateContent, buildRecommendationPrompt } from "@/lib/gemini";

export async function GET() {
  try {
    const [totalCases, totalExecutions, executions, failedCases] =
      await Promise.all([
        prisma.testCase.count(),
        prisma.testExecution.count(),
        prisma.testExecution.findMany({
          include: { testCase: true },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        prisma.testExecution.findMany({
          where: { status: "FAILED" },
          include: { testCase: true },
          take: 20,
        }),
      ]);

    const passRate =
      totalExecutions > 0
        ? Math.round(
            (executions.filter((e) => e.status === "PASSED").length /
              totalExecutions) *
              100,
          )
        : 0;

    const prompt = buildRecommendationPrompt({
      projectName: "TestHub",
      totalCases,
      totalExecutions,
      passRate,
      failedCases: failedCases.map((e) => e.testCase?.key || "unknown"),
    });

    let recommendations: unknown = [];
    try {
      const text = await generateContent([{ role: "user", parts: [{ text: prompt }] }], {
        temperature: 0.7,
        maxTokens: 2048,
      });
      recommendations = JSON.parse(text);
    } catch {
      recommendations = [];
    }

    return json(recommendations);
  } catch {
    return error("Failed to generate recommendations", 500);
  }
}

export async function POST() {
  try {
    const recommendations = await generateContent(
      [
        {
          role: "user",
          parts: [{ text: "Generate AI recommendations for test quality improvement." }],
        },
      ],
      { temperature: 0.7 },
    );
    return json({ recommendations });
  } catch {
    return error("Failed to generate recommendations", 500);
  }
}
