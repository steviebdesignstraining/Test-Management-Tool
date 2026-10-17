export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { generateContent } from "@/lib/gemini";
import type { GeminiMessage } from "@/lib/gemini";
import { sanitizeInput, FIELD_LIMITS } from "@/lib/validation";
import { requireUser, accessibleProjectIds, scope } from "@/lib/api-auth";
import { rateLimit } from "@/lib/auth";

export async function POST(req: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.res;
  const rl = rateLimit(`ai-chat:${auth.user.id}`, { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) return error("Too many AI requests. Please wait a minute.", 429);
  try {
    const inProjects = scope(await accessibleProjectIds(auth.user));
    const { message, conversationHistory } = await req.json();
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return error("A non-empty message is required", 400);
    }

    const cleanMessage = sanitizeInput(message.trim()).slice(0, FIELD_LIMITS.search);

    const [testCases, executions, defects] = await Promise.all([
      prisma.testCase.count({ where: { projectId: inProjects } }),
      prisma.testExecution.count({ where: { testCase: { projectId: inProjects } } }),
      prisma.defect.count({ where: { testCase: { projectId: inProjects } } }),
    ]);

    const passedExecutions = await prisma.testExecution.count({
      where: { status: "PASSED", testCase: { projectId: inProjects } },
    });
    const passRate =
      executions > 0 ? Math.round((passedExecutions / executions) * 100) : 0;

    const systemInstruction = `
You are a helpful QA assistant for TestHub, a test management platform.

Current project metrics:
- Total test cases: ${testCases}
- Total executions: ${executions}
- Total defects: ${defects}
- Pass rate: ${passRate}%

Guidelines:
- Answer questions about project quality metrics using the data above.
- Never ask for or reveal passwords, API keys, secrets, or personal data.
- If asked to generate test cases, steps, or analysis, suggest using the dedicated AI features.
- Keep answers concise and focused on testing/quality topics.
- If you don't know something, say so.
- Never execute commands, access systems, or perform actions beyond answering questions.
`.trim();

    const messages: GeminiMessage[] = [
      { role: "user", parts: [{ text: systemInstruction + "\n\nUser: " + cleanMessage }] },
    ];

    if (Array.isArray(conversationHistory)) {
      for (const turn of conversationHistory.slice(-6)) {
        if (typeof turn.content !== "string") continue;
        const cleanContent = sanitizeInput(turn.content).slice(0, FIELD_LIMITS.comment);
        messages.push({
          role: turn.role === "assistant" ? ("model" as const) : ("user" as const),
          parts: [{ text: cleanContent }],
        });
      }
      messages.push({ role: "user", parts: [{ text: cleanMessage }] });
    }

    const text = await generateContent(messages, {
      temperature: 0.7,
      maxTokens: 1024,
    });

    return json({ response: text });
  } catch (err) {
    console.error("ai-chat failed", err);
    return error("The AI assistant is unavailable right now.", 500);
  }
}
