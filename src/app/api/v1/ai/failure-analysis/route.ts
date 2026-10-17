export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { generateContent, buildFailureAnalysisPrompt } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { testExecutionId, errorMessage, stackTrace, executionLogs, environment } =
      await req.json();

    let testCaseKey = "unknown";
    let testCaseTitle = "unknown";
    if (testExecutionId) {
      const execution = await prisma.testExecution.findUnique({
        where: { id: testExecutionId },
        include: { testCase: true },
      });
      if (execution) {
        testCaseKey = execution.testCase?.key || "unknown";
        testCaseTitle = execution.testCase?.title || "unknown";
      }
    }

    const prompt = buildFailureAnalysisPrompt({
      testCaseKey,
      testCaseTitle,
      errorMessage: errorMessage || "",
      stackTrace: stackTrace || undefined,
      executionLogs: executionLogs || undefined,
      environment: environment || undefined,
    });

    const text = await generateContent(
      [{ role: "user", parts: [{ text: prompt }] }],
      { temperature: 0.5, maxTokens: 2048 },
    );

    let analysis: unknown = {};
    try {
      analysis = JSON.parse(text);
    } catch {
      analysis = { raw: text };
    }

    return json({ analysis }, 201);
  } catch (err) {
    return error(
      err instanceof Error ? err.message : "Failed to analyze failure",
      500,
    );
  }
}
