import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

/**
 * Ratchet: every API route must authenticate in the handler (defence in depth behind middleware).
 * UNPROTECTED_BASELINE lists routes that still need work. It may only SHRINK:
 *  - a new route without auth fails this test
 *  - a baseline route that gains auth must be removed from the list
 */
const ROOT = join(process.cwd(), "src/app/api");
const PUBLIC = [/^src\/app\/api\/v1\/auth\//, /^src\/app\/api\/health\//, /^src\/app\/api\/ready\//, /^src\/app\/api\/docs\//];
const PROTECTED = /requireUser|getCurrentUser|verifyGithubSignature|withAuth|requireProjectAccess/;

const UNPROTECTED_BASELINE = new Set([
  "src/app/api/v1/ai/failure-analysis/route.ts",
  "src/app/api/v1/ai/recommendations/[recommendationId]/feedback/route.ts",
  "src/app/api/v1/ai/recommendations/route.ts",
  "src/app/api/v1/ai/strategy-review/route.ts",
  "src/app/api/v1/audit-logs/route.ts",
  "src/app/api/v1/automation-repositories/route.ts",
  "src/app/api/v1/automation-scripts/route.ts",
  "src/app/api/v1/ci-connections/[connectionId]/sync/route.ts",
  "src/app/api/v1/ci-connections/route.ts",
  "src/app/api/v1/imports/allure/route.ts",
  "src/app/api/v1/imports/cypress/route.ts",
  "src/app/api/v1/imports/junit/route.ts",
  "src/app/api/v1/imports/playwright/route.ts",
  "src/app/api/v1/imports/webdriverio/route.ts",
  "src/app/api/v1/integrations/[integrationId]/route.ts",
  "src/app/api/v1/integrations/[integrationId]/sync/route.ts",
  "src/app/api/v1/integrations/route.ts",
  "src/app/api/v1/me/route.ts",
  "src/app/api/v1/organisations/[organisationId]/route.ts",
  "src/app/api/v1/organisations/[organisationId]/settings/route.ts",
  "src/app/api/v1/organisations/route.ts",
  "src/app/api/v1/projects/[projectId]/activity/route.ts",
  "src/app/api/v1/reconciliation-queue/route.ts",
  "src/app/api/v1/reconciliation/[suggestionId]/review/route.ts",
  "src/app/api/v1/reports/route.ts",
  "src/app/api/v1/requirements/[requirementId]/route.ts",
  "src/app/api/v1/requirements/[requirementId]/test-cases/route.ts",
  "src/app/api/v1/test-cases/[testCaseId]/automation-mappings/route.ts",
  "src/app/api/v1/test-cases/[testCaseId]/steps/route.ts",
  "src/app/api/v1/test-cases/export/route.ts",
  "src/app/api/v1/test-executions/[executionId]/route.ts",
  "src/app/api/v1/test-plans/[testPlanId]/route.ts",
  "src/app/api/v1/test-runs/[testRunId]/route.ts",
  "src/app/api/v1/test-step-results/[stepResultId]/route.ts",
  "src/app/api/v1/test-strategies/route.ts",
]);

function routes(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? routes(p) : n === "route.ts" ? [p] : [];
  });
}

describe("API route authentication coverage", () => {
  const files = routes(ROOT).map((p) => [relative(process.cwd(), p), readFileSync(p, "utf8")] as const);

  it("has no new unauthenticated routes", () => {
    const offenders = files
      .filter(([rel]) => !PUBLIC.some((rx) => rx.test(rel)))
      .filter(([, src]) => !PROTECTED.test(src))
      .map(([rel]) => rel)
      .filter((rel) => !UNPROTECTED_BASELINE.has(rel));
    expect(offenders).toEqual([]);
  });

  it("keeps the baseline honest (remove entries once a route is protected)", () => {
    const stale = files.filter(([rel, src]) => UNPROTECTED_BASELINE.has(rel) && PROTECTED.test(src)).map(([rel]) => rel);
    expect(stale).toEqual([]);
  });
});

describe("secrets", () => {
  it("has no hardcoded session-secret fallback", () => {
    const hits = [ "middleware.ts", "src/lib/auth.ts", "src/lib/auth-utils.ts", "src/app/api/v1/me/route.ts" ]
      .filter((f) => readFileSync(join(process.cwd(), f), "utf8").includes("dev-secret-change-me"));
    expect(hits).toEqual([]);
  });
});