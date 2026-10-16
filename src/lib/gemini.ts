const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface GeminiOptions {
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
}

export class GeminiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "GeminiError";
  }
}

function isConfigured(): boolean {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 0);
}

export async function generateContent(
  messages: GeminiMessage[],
  options: GeminiOptions = {},
): Promise<string> {
  if (!isConfigured()) {
    throw new GeminiError(
      "Gemini API key is not configured. Set GEMINI_API_KEY in your environment.",
      503,
    );
  }

  const contents = messages.map((m) => ({
    role: m.role,
    parts: m.parts,
  }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 1024,
    },
  };

  if (options.systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    };
  }

  const url = `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new GeminiError(
          `Gemini API error (${res.status}): ${errorText}`,
          res.status,
        );
      }

      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
        error?: { message?: string };
      };

      if (data.error?.message) {
        throw new GeminiError(`Gemini API error: ${data.error.message}`, 500);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new GeminiError("Gemini returned an empty response", 500);
      }

      return text;
    } catch (err) {
      lastError = err;
      if (err instanceof GeminiError && err.status === 429) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      break;
    }
  }

  if (lastError instanceof GeminiError) {
    throw lastError;
  }
  throw new GeminiError(
    lastError instanceof Error ? lastError.message : "Gemini request failed",
  );
}

export function buildTestCaseDraftPrompt(context: {
  projectName: string;
  feature: string;
  acceptanceCriteria?: string;
  existingCases?: string;
}): string {
  return `
You are an expert QA engineer. Generate a comprehensive test case draft for the following context.

Project: ${context.projectName}
Feature: ${context.feature}
Acceptance Criteria: ${context.acceptanceCriteria || "None provided"}
Existing Test Cases: ${context.existingCases || "None"}

Return a JSON object with:
- title: concise test case title
- objective: what the test verifies
- preconditions: what must be true before running
- priority: one of HIGH, MEDIUM, LOW
- steps: array of { action, expectedResult, data? }
- tags: array of relevant tags

Only return valid JSON, no markdown fences or extra text.
`;
}

export function buildFailureAnalysisPrompt(context: {
  testCaseKey: string;
  testCaseTitle: string;
  errorMessage: string;
  stackTrace?: string;
  executionLogs?: string;
  environment?: string;
}): string {
  return `
You are an expert QA engineer analyzing a failed automated test execution.

Test Case: ${context.testCaseKey} — ${context.testCaseTitle}
Environment: ${context.environment || "unknown"}
Error Message: ${context.errorMessage}
Stack Trace: ${context.stackTrace || "none"}
Execution Logs: ${context.executionLogs || "none"}

Return a JSON object with:
- likelyCause: the most probable root cause
- suggestedFix: concrete steps to fix
- isFlaky: boolean indicating if this looks like a flaky test
- confidence: number 0-100
- recommendedAction: one of "INVESTIGATE", "FIX_CODE", "UPDATE_TEST", "IGNORE_FLAKY"

Only return valid JSON, no markdown fences or extra text.
`;
}

export function buildRecommendationPrompt(context: {
  projectName: string;
  totalCases: number;
  totalExecutions: number;
  passRate: number;
  failedCases?: string[];
  flakyCases?: string[];
}): string {
  return `
You are a QA lead analyzing test quality for project "${context.projectName}".

Metrics:
- Total test cases: ${context.totalCases}
- Total executions: ${context.totalExecutions}
- Pass rate: ${context.passRate}%
- Failed cases: ${context.failedCases?.join(", ") || "none"}
- Flaky cases: ${context.flakyCases?.join(", ") || "none"}

Return a JSON array of recommendation objects, each with:
- title: short recommendation title
- description: detailed explanation
- priority: one of HIGH, MEDIUM, LOW
- category: one of "COVERAGE", "STABILITY", "AUTOMATION", "PROCESS"
- cites: array of relevant test case keys or CI run references

Only return valid JSON, no markdown fences or extra text.
`;
}

export function buildStrategyReviewPrompt(context: {
  projectName: string;
  strategyName: string;
  currentApproach: string;
  painPoints?: string[];
}): string {
  return `
You are a test automation architect reviewing a test strategy for project "${context.projectName}".

Strategy: ${context.strategyName}
Current approach: ${context.currentApproach}
Pain points: ${context.painPoints?.join(", ") || "none reported"}

Return a JSON object with:
- strengths: array of what works well
- weaknesses: array of gaps or risks
- recommendations: array of concrete improvements
- automationOpportunities: array of manual areas suitable for automation
- priority: one of HIGH, MEDIUM, LOW

Only return valid JSON, no markdown fences or extra text.
`;
}
