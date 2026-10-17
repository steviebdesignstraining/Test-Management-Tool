TestHub – Review, Improvement Plan and AI Agent Design
Prepared from a read-through of the uploaded repository (about 635 files, 14.7k lines of TypeScript). Findings marked Verified were confirmed in code; items marked Check are inferences you should confirm. I did not run the app or hit a live database.
1. What the patch already fixes
The file testhub-security-patch.diff applies cleanly to your archive (patch -p1 < testhub-security-patch.diff). It touches 20 files.
Area
Change
Session secret
Removed the dev-secret-change-me fallback from 4 files. getAuthSecret() throws in production if AUTH_SECRET is missing or under 32 characters.
Middleware
Now also gates /api/* (401 JSON without a session, with a public list for auth, webhooks, health, docs). Public pages fixed: register, forgot/reset password, verify-email, features, security, docs, integrations. VIEWER is no longer locked out of pages.
Shared helpers
requireUser, requireProjectRole, accessibleProjectIds, pick (field whitelist) for routes, and assertUser / assertProjectRole for server actions.
Server actions
All 26 now require a session. deleteWorkspace needs project OWNER. exportData exports only your projects. deleteTestCase and bulkDeleteTestCases need MANAGER. Client-supplied userId and uploadedById are ignored.
Project creation
Previously attached every project to organisation.findFirst() (the first org in the database) and never added the creator as a member. It now uses the caller's own organisation and adds them as OWNER.
Path traversal
uploadAttachment and uploadExecutionAttachment built filenames from raw file.name. Now sanitised with safeFileName. SVG uploads are blocked in the API.
Routes patched
defects (list, create, get, patch with a field whitelist), test-cases (list, create), attachments (list, create, download, delete), AI chat (auth, rate limit, project-scoped counts, no raw error leakage), GitHub webhook (HMAC signature check), /api/test deleted.
Guard rails
route-auth-coverage.test.ts fails if a new route has no auth, and tracks the 44 routes still to do (remaining-unprotected-routes.txt). Also added .gitignore and .env.example.
Verification: the ratchet test passes (3 of 3). TypeScript reports no errors in the touched files except the missing generated Prisma client, because my sandbox could not download Prisma binaries. Run npx prisma generate && npx tsc --noEmit on your machine.
Known follow-ups from the patch:
• Your existing api-contract.test.ts calls handlers with no session. Patched routes now return 401, so mock getCurrentUser (for example vi.mock('@/lib/auth-utils')) or add a withSession(user) helper.
• The middleware still uses the legacy role names (ADMIN, ORG_ADMIN, QA_LEAD…) while permissions.ts uses OWNER / MANAGER / TESTER / VIEWER. Decide on one set (section 2).
• Next 16 may expect proxy.ts instead of middleware.ts. Check the deprecation notice in your build output.
2. Remaining security and backend work
Verified
1. 44 routes still lack handler-level auth. The middleware now blocks anonymous callers, but any logged-in user can still read or modify other projects' data through them. Work through the list in this order: test-plans, test-runs, test-executions, test-step-results, requirements, integrations, imports/*, ci-*, organisations, reports, audit-logs, reconciliation*, ai/*.
2. Two role systems. Collapse to one: platform role (ADMIN or USER) plus per-project role (OWNER, MANAGER, TESTER, VIEWER). Store roles as Prisma enums instead of free strings.
3. Project key is globally unique (key String? @unique). Make it unique per organisation (@@unique([organisationId, key])) and make it required.
4. Rate limiter is an in-memory Map (resets on cold start, not shared across instances). Use Upstash Redis or a Postgres table, and also limit by account and by email, not only by IP.
5. Uploads go to local disk (/uploads). That fails on Vercel and similar hosts. Use S3, R2 or Vercel Blob with signed URLs, size and magic-byte checks, and optional virus scanning.
6. npm ci fails with ERESOLVE (next-auth@4 wants a different nodemailer). next-auth, @auth/prisma-adapter and @prisma/sdk are not imported anywhere, so remove them. Also drop @types/recharts (Recharts 3 ships its own types).
7. AI chat route put the system prompt inside a user message, appended the user's message twice when history existed, and returned raw error text. Fixed the error leak only. See section 7 for the proper design.
8. vitest.config.ts prints an ESM-in-CJS warning. Rename it to vitest.config.mts or set "type": "module".
9. No error.tsx, loading.tsx or global-error.tsx exist, so failures show the default error page and nothing streams.
Check
• User.githubAccessToken is a plain column. Confirm it is encrypted with your encryption.ts before saving, and that decrypt failing without ENCRYPTION_KEY is handled loudly.
• Sessions are stateless JWTs (7 days). Add a Session table (or token version on User) so logout, password reset and "sign out everywhere" really revoke access.
• Add security headers in next.config.ts (CSP, X-Content-Type-Options, Referrer-Policy, frame-ancestors).
• Server actions use FormData with manual parsing. Add schema validation.
Architecture suggestions
• Add a thin service layer (src/server/services/*) used by both routes and actions, so authorization, validation and audit logging live in one place instead of 100 handlers and 26 actions.
• Use Zod for every input and generate the OpenAPI spec from the same schemas, instead of the hand-written openapi.json.
• Replace prisma db push with Prisma Migrate and migration files in CI.
• Add Postgres row-level security keyed on organisation as a second wall behind the application checks.
• Move imports (JUnit, Allure, Playwright, Cypress, WebdriverIO) and CI sync to a background queue (Inngest, Trigger.dev or pg-boss) with idempotency keys, retries and progress, instead of work inside the request.
• Add indexes on projectId, testCaseId, status, createdAt for the biggest tables, and use cursor pagination for lists over a few thousand rows.
• Add soft delete for test cases, plans and defects (with restore), and an optimistic-concurrency version field so two editors cannot silently overwrite each other.
• Add structured logs, request IDs, Sentry and a /api/ready that checks the database.
3. Broken links and page gaps
Verified: links to pages that do not exist
Link
Found in
Fix
/organisations/{id}
organisations list
Create the organisation detail page (members, projects, settings)
/strategies/{id}
strategies list
Create the strategy detail page (sections, versions, approval)
/projects/{id}/integrations/{integrationId}
project integrations
Create the integration detail or edit page
/projects/{id}/integrations/create
project integrations
Create the connect flow, or open a modal instead
Verified: public pages that were unreachable. Logged-out visitors were redirected to sign-in from /register, /forgot-password, /reset-password, /verify-email/*, /features, /security, /docs and /integrations. The patch fixes this. Note that /integrations is both a public marketing link and an app page. Give the marketing one its own route (/features/integrations).
Missing pages worth adding
• Profile and account (password change, sessions, connected accounts, personal API tokens).
• Notifications centre and email preferences.
• Global search results and a command palette (Ctrl or Cmd + K).
• Test suite detail and a test case history or compare-versions page.
• Run detail (the per-run report with filters), plus a shareable read-only run link.
• Release or milestone page (plans, runs, defects, readiness and sign-off in one place).
• Traceability matrix (requirements to cases to results to defects).
• Onboarding checklist and sample-project page.
• Pricing or plans page if you intend to sell it; status page; changelog.
• Friendly 403 and 500 pages, plus per-section empty states.
4. UI and UX improvements
1. Tables: saved views, column chooser, sticky header, sticky bulk-action bar, inline status edit, server-side sort and filter in the URL (so views are shareable), and row virtualisation for long lists.
2. Forms and modals: autosave drafts, field-level errors with aria-describedby, "unsaved changes" prompt, and a progress stepper on the long project, strategy and plan modals (draft saved after each step).
3. Test case editor: drag-to-reorder steps, paste-a-table-to-create-steps, reusable shared steps, a Gherkin or BDD mode, and side-by-side version diff.
4. Execution view: keyboard shortcuts, a timer, a persistent mini-queue, quick "fail and file defect" with auto-attached last step, screenshot paste from the clipboard, and an "assigned to me" filter.
5. Dashboards: show denominators and time windows on every metric, drill-down from any chart to the underlying records, and "data last updated" stamps. Keep "—" for missing data instead of 0%.
6. Navigation: the sidebar has 18 items. Group by workflow (Design, Execute, Automate, Analyse, Admin), allow pinning, and add breadcrumbs and a project switcher that remembers the last project.
7. States: loading skeletons, empty states with a primary action, error boundaries with retry, optimistic updates and undo toasts for deletes.
8. Accessibility: focus trap and Esc for modals, visible focus rings, colour never the only status signal, form labels, and an axe check inside your Playwright suite.
9. Polish: dark mode (the design tokens already make this easy), responsive tables on mobile, localisation-ready strings, and date formatting by user locale.
5. Features industry tools offer that you can add
Comparison set: TestRail, Zephyr, Xray, qTest, Qase, PractiTest, BrowserStack Test Management.
High value, moderate effort
• Custom fields and templates per project (text, dropdown, steps, BDD).
• Shared steps and parameterised data sets (CSV import, data-driven runs).
• Test configurations matrix (browser × OS × environment) for one plan.
• Milestones and releases with burn-up and readiness.
• Comments, @mentions, activity feed and watchers on every record.
• Import and migration from TestRail, Zephyr, Xray and CSV, with a field-mapping preview.
• Two-way Jira, Azure DevOps and GitHub Issues sync (status, assignee, comments), with a conflict policy.
• Outbound webhooks and personal or service API tokens with scopes.
• Flaky test detection with auto-quarantine rules, and test-history trend per test.
• Scheduled and triggered runs (nightly, on deploy) with results ingested automatically.
Higher effort, strong differentiators
• Risk-based testing: score requirements by change size, failure history and criticality, then recommend the smallest high-value suite (test impact analysis from the git diff).
• Exploratory session recording: charters, time-boxed sessions, notes, screenshots and one-click defect creation.
• Visual regression and accessibility result ingestion (Playwright snapshots, axe).
• Test data management with masking.
• Enterprise: SSO (SAML or OIDC), SCIM provisioning, audit log export, data residency, IP allow-lists, retention policies, and approval workflows with e-signature for regulated teams.
• Public status or release report pages that stakeholders can open without logging in.
6. Improvements by journey
Journey
Today (from the code)
Improve
Sign up and verify
Register, email verification, GitHub OAuth. Register was blocked by middleware.
Fixed access. Add resend with cooldown, password-strength meter, breached-password check, and a first-run wizard (create project, import cases, connect GitHub).
Create a project
Modal with many fields. Orgs were shared and creators were not members.
Fixed in the patch. Add a template picker, invite teammates in the last step, and a "load sample data" option.
Author test cases
Create modal, edit page, AI draft import, export.
Autosave, versioned review workflow (Draft, In Review, Approved), duplicate detection before save, step templates, bulk edit, attachments in steps.
Strategy then plan
Both are list pages with modals.
Detail pages with sections, versions, reviewer approval and a visible link from plan to strategy version. Generate a plan from selected requirements and risks.
Execute tests
Runs page with step results and attachments.
Keyboard flow, auto-timer, evidence paste, defect prefill, rerun failed only, assignment and reassignment, run-level sign-off.
Defects
List, detail, optional ticket creation.
Lifecycle with required fields per status, duplicate suggestions, link to run and CI evidence, two-way sync, SLA and ageing views.
CI results
Import routes for JUnit, Allure, Playwright, Cypress, WebdriverIO.
Queue-based ingestion with a preview and idempotency, GitHub Action or CLI for uploads, automatic mapping to cases by tag, and a clear missing-artifact report.
Reconciliation
Queue and review route exist.
Show the evidence side by side, batch approve at or above a threshold, record reviewer and reason, and make auto-complete opt-in per project.
Reporting
Overview, analytics, reports.
Release readiness report (PDF and shareable link), scheduled email digests, quality-gate history, and a coverage matrix by requirement.
Admin
Team, organisations, settings, audit logs.
Role matrix editor, invitation expiry and resend, audit export, retention settings, danger-zone confirmations that require typing the project key.
7. AI agents and chatbot for testing
7.1 Principles
• Grounded: every answer cites TestHub records (case, run, defect, CI job). No citation, no claim.
• Permission-scoped: the agent acts as the signed-in user. Its tools reuse requireProjectRole, so it can never see more than the user can.
• Propose, don't commit: agents write drafts and suggestions. A human approves before anything changes a case, plan, mapping or defect.
• Untrusted input: CI logs, imported reports, defect text and uploaded files can contain prompt injection. Treat them as data, delimit them, and never let them trigger tools.
• Auditable: log prompt version, model, tools called, records read and the human decision.
7.2 Chatbot (replace the current /api/v1/ai/chat)
Fix first: use the model's real systemInstruction field, send the user message once, stream the response (SSE), keep a stored conversation per user and project, and cap tokens and spend per user.
Tool-calling design (use the Gemini function-calling API, or the Anthropic API if you switch). Read tools only at first:
Tool
Purpose
search_test_cases(query, filters)
Hybrid keyword and vector search
get_run_summary(runId)
Totals, failures, flaky list, environment
list_failures(runId, since)
Failed results with error excerpts
get_coverage(projectId, requirementId?)
Requirement-to-case-to-result coverage
get_defect(defectId) and search_defects
Defect context
get_release_readiness(planId)
Entry and exit criteria status
Write tools return a draft with an Approve button in the UI, never a direct write: propose_test_cases, propose_defect, propose_plan_scope, propose_mapping.
Retrieval: enable pgvector on Neon. Embed test cases, requirements, defect summaries and strategy sections, filter by project before similarity, and keep embeddings in sync with a queue job on change.
UI: a docked side panel on every page that knows the current page context (open case, run or plan), suggested prompts ("Why did this run fail?", "What is not covered?"), inline citations, thumbs up or down, and "insert into editor".
7.3 Agents worth building
Agent
What it does
Inputs
Output (needs approval)
Test Designer
Turns a requirement or user story into positive, negative, boundary and accessibility cases
Requirement, acceptance criteria, existing cases
Draft cases linked to the requirement
Coverage Analyst
Finds untested requirements, risks and acceptance criteria
Traceability graph
Ranked gap list with suggested cases
Failure Triage
Clusters CI failures by error signature, separates product bugs from environment and flaky causes, suggests owner
CI run, logs, history, recent commits
Triage report and draft defects
Flaky Test Guardian
Detects intermittent tests, proposes quarantine and a likely cause
Execution history
Quarantine proposal with evidence
Reconciliation Reviewer
Compares manual cases to automated results and suggests completion
Mappings, results, build and environment
Suggestions with confidence for the review queue
Release Readiness
Summarises readiness against exit criteria and residual risk
Plan, runs, defects, gates
Readiness note for sign-off
Strategy and Plan Drafter
Drafts strategy sections and plans from the project profile and prior plans
Project, risks, templates
Draft document with version diff
Automation Mapper
Matches manual cases to Playwright, Cypress or WebdriverIO tests by tag, name and path
Repo index
Mapping proposals; optionally opens a pull request with a generated test
Exploratory Copilot
Suggests charters and next ideas during a session; turns notes into cases and defects
Session notes, product area history
Draft charter, cases and defects
Duplicate Detector
Warns on near-duplicate cases and defects at creation time
Embeddings
Inline warning with links
Build order: Failure Triage and Test Designer first (highest daily value, lowest risk), then Coverage Analyst, Reconciliation Reviewer and Release Readiness.
7.4 Implementation sketch
1. Add src/server/ai/ with agent.ts (tool loop with a max of 6 steps), tools/*.ts (each tool takes { user, input }, validates with Zod, calls a service), prompts/*.md (versioned) and policy.ts (which tools each agent may call).
2. Persist AiConversation, AiMessage, AiToolCall and AiSuggestion (status: PROPOSED, ACCEPTED, REJECTED, EDITED) tables. Your existing recommendation feedback route fits AiSuggestion.
3. Run long agents (triage over a big CI run) as background jobs and stream progress to the UI.
4. Redact secrets, tokens and emails from anything sent to the model; keep a per-organisation switch for AI and a data-retention setting (you already have the settings screen).
5. Add an evaluation set: 30 to 50 real examples (failures with known causes, requirements with expected cases) run in CI to catch regressions when prompts or models change. Track acceptance rate of suggestions as the main quality metric.
6. Add cost controls: per-user rate limits (the patch adds 20 requests a minute to chat), per-org monthly token budget, and a fallback message when the gateway is down.
7. Verify the Neon AI Gateway or Gemini SDK function-calling syntax against current docs before coding; do not assume method names.
8. Suggested roadmap
This week
• Apply the patch, run prisma generate, typecheck, fix api-contract tests with a session mock.
• Rotate AUTH_SECRET and any secret that was ever committed. Set GITHUB_WEBHOOK_SECRET.
• Protect the next 15 routes from the baseline list (plans, runs, executions, requirements, integrations).
• Remove unused dependencies so npm ci works without --legacy-peer-deps.
Next 2 to 4 weeks
• Finish the remaining 44 routes and delete the baseline file. Unify roles and add enums.
• Add the four missing detail pages and error.tsx / loading.tsx.
• Object storage for uploads, Redis rate limiting, Prisma Migrate, security headers.
• Chatbot v2 with streaming, citations and read-only tools.
Next quarter
• Failure Triage and Test Designer agents, pgvector search, background queue.
• Custom fields, shared steps, test configurations, milestones and release page.
• TestRail and Xray import, two-way Jira sync, outbound webhooks and API tokens.
• SSO and audit export for enterprise customers.
9. How to apply the patch
1. From your repo root: patch -p1 < testhub-security-patch.diff (or git apply -p1; the paths start with a directory prefix).
2. npm uninstall next-auth @auth/prisma-adapter @prisma/sdk @types/recharts && npm install.
3. npx prisma generate && npx tsc --noEmit && npm test.
4. Set AUTH_SECRET (32+ characters) in every environment. The app now refuses to start in production without it.
5. Smoke-test: sign out and open /register; call /api/v1/test-cases with no cookie (expect 401); as a non-member, request another project's defect (expect 404); as a VIEWER, try to delete a test case (expect an error).

Testhub security patch
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/.env.example fix/.env.example
--- base/.env.example	1970-01-01 00:00:00.000000000 +0000
+++ fix/.env.example	2026-10-16 20:07:46.845486786 +0000
@@ -0,0 +1,24 @@
+# Database (Neon)
+DATABASE_URL=postgresql://user:password@host/db?sslmode=require
+DATABASE_URL_UNPOOLED=postgresql://user:password@host/db?sslmode=require
+
+# Session signing: REQUIRED, 32+ random chars (openssl rand -hex 32). App refuses to start in production without it.
+AUTH_SECRET=
+# 64 hex chars for AES-256-GCM encryption of stored tokens (openssl rand -hex 32)
+ENCRYPTION_KEY=
+
+# AI
+GEMINI_API_KEY=
+GEMINI_MODEL=gemini-flash-lite-latest
+
+# GitHub OAuth + webhooks
+GITHUB_CLIENT_ID=
+GITHUB_CLIENT_SECRET=
+GITHUB_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback
+GITHUB_WEBHOOK_SECRET=
+
+# Email (verification, password reset)
+SMTP_HOST=
+SMTP_PORT=587
+SMTP_USER=
+SMTP_PASS=
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/.gitignore fix/.gitignore
--- base/.gitignore	1970-01-01 00:00:00.000000000 +0000
+++ fix/.gitignore	2026-10-16 20:07:46.844088528 +0000
@@ -0,0 +1,11 @@
+node_modules/
+.next/
+.env
+.env.*
+!.env.example
+uploads/
+test-results/
+playwright-report/
+*.tsbuildinfo
+.DS_Store
+__MACOSX/
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/middleware.ts fix/middleware.ts
--- base/middleware.ts	2026-10-15 22:55:17.000000000 +0000
+++ fix/middleware.ts	2026-10-16 20:07:07.074016954 +0000
@@ -1,90 +1,64 @@
 import { NextResponse } from "next/server";
 import type { NextRequest } from "next/server";
 import jwt from "jsonwebtoken";
+import { getAuthSecret } from "@/lib/auth-secret";
 
-const JWT_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
+/** Pages a signed-out visitor may open. */
+const PUBLIC_PAGES = ["/", "/sign-in", "/register", "/forgot-password", "/reset-password", "/features", "/security", "/docs", "/integrations"];
+const PUBLIC_PAGE_PREFIXES = ["/verify-email/"];
+/** API paths that must work without a session (each still validates its own input/signature). */
+const PUBLIC_API_PREFIXES = ["/api/v1/auth/", "/api/v1/webhooks/", "/api/health", "/api/ready", "/api/docs"];
+/** Signed-in users are bounced away from these. */
+const AUTH_ONLY_PAGES = ["/sign-in", "/register", "/forgot-password"];
+
+// Single hierarchy. Fine-grained write checks happen per project in route handlers / actions.
+const LEVEL: Record<string, number> = { VIEWER: 0, READ_ONLY: 0, USER: 1, TESTER: 2, QA_LEAD: 3, PROJECT_ADMIN: 4, ORG_ADMIN: 5, ADMIN: 6 };
+const MIN_LEVEL: Array<[string, number]> = [
+  ["/admin", 5],
+  ["/settings", 4],
+  ["/team", 3],
+];
 
-const publicRoutes = ["/sign-in"];
-
-const roleHierarchy: Record<string, number> = {
-  READ_ONLY: 0,
-  USER: 1,
-  TESTER: 2,
-  QA_LEAD: 3,
-  PROJECT_ADMIN: 4,
-  ORG_ADMIN: 5,
-  ADMIN: 6,
-};
-
-const roleLevels: Record<string, string[]> = {
-  "/admin": ["ADMIN", "ORG_ADMIN"],
-  "/settings": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN"],
-  "/team": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN", "QA_LEAD"],
-  "/requirements": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN", "QA_LEAD", "TESTER", "USER"],
-  "/test-cases": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN", "QA_LEAD", "TESTER", "USER"],
-  "/test-plans": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN", "QA_LEAD", "TESTER", "USER"],
-  "/test-runs": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN", "QA_LEAD", "TESTER", "USER"],
-  "/defects": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN", "QA_LEAD", "TESTER", "USER"],
-  "/projects": ["ADMIN", "ORG_ADMIN", "PROJECT_ADMIN", "QA_LEAD", "TESTER", "USER"],
-};
-
-function getAllowedRoles(pathname: string): string[] | null {
-  for (const [prefix, roles] of Object.entries(roleLevels)) {
-    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
-      return roles;
-    }
+function session(request: NextRequest): { userId: string; role: string } | null {
+  const token = request.cookies.get("session")?.value;
+  if (!token) return null;
+  try {
+    const p = jwt.verify(token, getAuthSecret()) as { userId: string; role?: string };
+    return { userId: p.userId, role: p.role ?? "USER" };
+  } catch {
+    return null;
   }
-  return null;
-}
-
-function roleLevel(role: string): number {
-  return roleHierarchy[role] ?? 0;
 }
 
 export function middleware(request: NextRequest) {
   const { pathname } = request.nextUrl;
-  const token = request.cookies.get("session")?.value;
+  const s = session(request);
 
-  let userId: string | null = null;
-  let userRole: string | null = null;
-  if (token) {
-    try {
-      const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role?: string };
-      userId = payload.userId;
-      userRole = payload.role ?? null;
-    } catch {
-      userId = null;
-      userRole = null;
-    }
+  if (pathname.startsWith("/api/")) {
+    if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();
+    if (!s) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
+    return NextResponse.next();
   }
 
-  const isPublic = publicRoutes.includes(pathname) || pathname === "/";
+  const isPublic = PUBLIC_PAGES.includes(pathname) || PUBLIC_PAGE_PREFIXES.some((p) => pathname.startsWith(p));
 
   if (isPublic) {
-    if (userId) {
-      return NextResponse.redirect(new URL("/overview", request.url));
-    }
+    if (s && AUTH_ONLY_PAGES.includes(pathname)) return NextResponse.redirect(new URL("/overview", request.url));
     return NextResponse.next();
   }
 
-  if (!userId) {
-    const signInUrl = new URL("/sign-in", request.url);
-    signInUrl.searchParams.set("callbackUrl", pathname);
-    return NextResponse.redirect(signInUrl);
+  if (!s) {
+    const url = new URL("/sign-in", request.url);
+    url.searchParams.set("callbackUrl", pathname);
+    return NextResponse.redirect(url);
   }
 
-  const allowedRoles = getAllowedRoles(pathname);
-  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
-    const level = roleLevel(userRole);
-    const maxAllowed = Math.max(...allowedRoles.map((r) => roleLevel(r)));
-    if (level < maxAllowed) {
-      return NextResponse.redirect(new URL("/overview", request.url));
-    }
-  }
+  const rule = MIN_LEVEL.find(([prefix]) => pathname === prefix || pathname.startsWith(prefix + "/"));
+  if (rule && (LEVEL[s.role] ?? 0) < rule[1]) return NextResponse.redirect(new URL("/overview", request.url));
 
   return NextResponse.next();
 }
 
 export const config = {
-  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
+  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
 };
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/app/actions.ts fix/src/app/actions.ts
--- base/src/app/actions.ts	2026-10-16 16:10:12.000000000 +0000
+++ fix/src/app/actions.ts	2026-10-16 20:07:35.005289786 +0000
@@ -2,6 +2,8 @@
 
 import { prisma } from "@/lib/prisma";
 import { revalidatePath } from "next/cache";
+import { assertUser, assertProjectRole, assertTestCaseRole, accessibleProjectIds, scope } from "@/lib/api-auth";
+import { safeFileName } from "@/lib/files";
 import {
   sanitizeInput,
   FIELD_LIMITS,
@@ -11,6 +13,7 @@
 } from "@/lib/validation";
 
 export async function createProject(formData: FormData) {
+  const user = await assertUser();
   const name = sanitizeInput(String(formData.get("name") || ""));
   const keyRaw = String(formData.get("key") || "");
   const description = sanitizeInput(String(formData.get("description") || ""));
@@ -57,9 +60,19 @@
     throw new Error(statusValidation.error);
   }
 
-  let org = await prisma.organisation.findFirst();
-  if (!org) {
-    org = await prisma.organisation.create({ data: { name: "Default Workspace" } });
+  // Attach to one of THIS user's organisations (never "the first org in the database").
+  let membership = await prisma.organisationMember.findFirst({
+    where: { userId: user.id },
+    select: { organisationId: true },
+  });
+  if (!membership) {
+    const created = await prisma.organisation.create({
+      data: {
+        name: `${user.name || user.email}'s workspace`,
+        members: { create: { userId: user.id, role: "OWNER" } },
+      },
+    });
+    membership = { organisationId: created.id };
   }
 
   await prisma.project.create({
@@ -79,7 +92,8 @@
       startDate,
       targetDate,
       status: status || "DRAFT",
-      organisationId: org.id,
+      organisationId: membership.organisationId,
+      members: { create: { userId: user.id, role: "OWNER" } },
       businessOwnerId,
       projectManagerId,
       qaLeadId,
@@ -89,6 +103,7 @@
 }
 
 export async function createStrategy(formData: FormData) {
+  await assertUser();
   const name = sanitizeInput(String(formData.get("name") || "")).slice(0, FIELD_LIMITS.title);
   const projectId = String(formData.get("projectId") || "");
   const version = String(formData.get("version") || "1.0");
@@ -158,6 +173,7 @@
 }
 
 export async function createTestCase(formData: FormData) {
+  await assertUser();
   const key = formData.get("key") as string;
   const title = formData.get("title") as string;
   const description = formData.get("description") as string;
@@ -288,6 +304,7 @@
 }
 
 export async function createTestPlan(formData: FormData) {
+  await assertUser();
   const name = sanitizeInput(String(formData.get("name") || ""));
   const projectId = String(formData.get("projectId") || "");
   const strategyId = String(formData.get("strategyId") || "") || undefined;
@@ -344,6 +361,7 @@
 }
 
 export async function createExecution(formData: FormData) {
+  await assertUser();
   const testCaseId = formData.get("testCaseId") as string;
   const status = formData.get("status") as string;
   const testerId = formData.get("testerId") as string;
@@ -352,6 +370,7 @@
 }
 
 export async function createDefect(formData: FormData) {
+  await assertUser();
   const title = formData.get("title") as string;
   const severity = formData.get("severity") as string;
   const reporterId = formData.get("reporterId") as string;
@@ -369,12 +388,15 @@
 }
 
 export async function deleteTestCase(formData: FormData) {
+  const user = await assertUser();
   const id = formData.get("id") as string;
+  await assertTestCaseRole(user, id, "MANAGER");
   await prisma.testCase.delete({ where: { id } });
   revalidatePath("/test-cases");
 }
 
 export async function addTestCaseToPlan(formData: FormData) {
+  await assertUser();
   const testPlanId = formData.get("testPlanId") as string;
   const testCaseId = formData.get("testCaseId") as string;
   const suiteName = (formData.get("suiteName") as string) || "Default";
@@ -400,6 +422,7 @@
 }
 
 export async function updateTestCase(formData: FormData) {
+  await assertUser();
   const id = formData.get("id") as string;
   const title = formData.get("title") as string;
   const description = formData.get("description") as string;
@@ -466,6 +489,7 @@
 }
 
 export async function addTestStep(formData: FormData) {
+  await assertUser();
   const testCaseId = formData.get("testCaseId") as string;
   const action = formData.get("action") as string;
   const expectedResult = formData.get("expectedResult") as string;
@@ -489,6 +513,7 @@
 }
 
 export async function updateTestStep(formData: FormData) {
+  await assertUser();
   const id = formData.get("id") as string;
   const testCaseId = formData.get("testCaseId") as string;
   const action = formData.get("action") as string;
@@ -513,6 +538,7 @@
 }
 
 export async function deleteTestStep(formData: FormData) {
+  await assertUser();
   const id = formData.get("id") as string;
   const testCaseId = formData.get("testCaseId") as string;
 
@@ -525,6 +551,7 @@
 }
 
 export async function updateStepResult(formData: FormData) {
+  await assertUser();
   const id = formData.get("id") as string;
   const status = formData.get("status") as string;
   const actualResult = formData.get("actualResult") as string;
@@ -541,16 +568,16 @@
 }
 
 export async function uploadAttachment(formData: FormData) {
+  const user = await assertUser();
   const file = formData.get("file") as File;
   const testCaseId = formData.get("testCaseId") as string || undefined;
-  const uploadedById = formData.get("uploadedById") as string || undefined;
+  const uploadedById = user.id; // never trust a client-supplied uploader
 
   if (!file) {
     throw new Error("No file provided");
   }
-  if (!uploadedById) {
-    throw new Error("uploadedById is required");
-  }
+  if (file.size > 10 * 1024 * 1024) throw new Error("File size exceeds 10MB limit");
+  if (testCaseId) await assertTestCaseRole(user, testCaseId, "TESTER");
 
   const bytes = await file.arrayBuffer();
   const buffer = Buffer.from(bytes);
@@ -563,7 +590,7 @@
     fs.mkdirSync(UPLOAD_DIR, { recursive: true });
   }
 
-  const filename = `${randomUUID()}-${file.name.replace(/\s+/g, "_")}`;
+  const filename = `${randomUUID()}-${safeFileName(file.name)}`;
   const filePath = path.join(UPLOAD_DIR, filename);
   fs.writeFileSync(filePath, buffer);
 
@@ -582,18 +609,19 @@
 }
 
 export async function bulkDeleteTestCases(formData: FormData) {
+  await assertUser();
   const ids = formData.getAll("ids") as string[];
   if (ids.length === 0) {
     throw new Error("No test cases selected");
   }
+  const user = await assertUser();
+  for (const id of ids) await assertTestCaseRole(user, id, "MANAGER");
   await prisma.testCase.deleteMany({ where: { id: { in: ids } } });
   revalidatePath("/test-cases");
 }
 
-export async function getUserSettings(userId: string) {
-  if (!userId) {
-    throw new Error("userId is required");
-  }
+export async function getUserSettings(_userId?: string) {
+  const userId = (await assertUser()).id; // always the signed-in user
   const settings = await prisma.userSettings.findUnique({
     where: { userId },
   });
@@ -606,10 +634,7 @@
 }
 
 export async function saveUserSettings(formData: FormData) {
-  const userId = formData.get("userId") as string;
-  if (!userId) {
-    throw new Error("userId is required");
-  }
+  const userId = (await assertUser()).id; // ignore any client-supplied userId
 
   const aiEnabled = formData.get("aiEnabled") === "true" || formData.get("aiEnabled") === "on";
   const autoComplete = (formData.get("autoComplete") as string) || "OFF";
@@ -682,13 +707,15 @@
   revalidatePath("/settings");
 }
 
-export async function exportData(userId: string) {
-  if (!userId) {
-    throw new Error("userId is required");
-  }
+export async function exportData(_userId?: string) {
+  await assertUser();
+  // The client-supplied id is ignored; we export only what the signed-in user can access.
+  const user = await assertUser();
+  const inProjects = scope(await accessibleProjectIds(user));
 
   const [testCases, executions, defects, requirements, testPlans] = await Promise.all([
     prisma.testCase.findMany({
+      where: { projectId: inProjects },
       include: {
         steps: true,
         project: true,
@@ -696,20 +723,24 @@
       },
     }),
     prisma.testExecution.findMany({
+      where: { testCase: { projectId: inProjects } },
       include: { testCase: true, tester: { select: { id: true, email: true, name: true } } },
     }),
     prisma.defect.findMany({
+      where: { testCase: { projectId: inProjects } },
       include: {
         reporter: { select: { id: true, email: true, name: true } },
       },
     }),
     prisma.requirement.findMany({
+      where: { projectId: inProjects },
       include: {
         acceptanceCriteria: true,
         testCases: { include: { testCase: true } },
       },
     }),
     prisma.testPlan.findMany({
+      where: { projectId: inProjects },
       include: { project: true },
     }),
   ]);
@@ -724,10 +755,10 @@
   };
 }
 
-export async function deleteWorkspace(userId: string, projectId: string) {
-  if (!userId || !projectId) {
-    throw new Error("userId and projectId are required");
-  }
+export async function deleteWorkspace(_userId: string, projectId: string) {
+  const user = await assertUser();
+  if (!projectId) throw new Error("projectId is required");
+  await assertProjectRole(user, projectId, "OWNER");
 
   await prisma.$transaction(async (tx) => {
     const cases = await tx.testCase.findMany({
@@ -792,6 +823,7 @@
 }
 
 export async function importAITestCase(formData: FormData) {
+  await assertUser();
   const title = formData.get("title") as string;
   const objective = formData.get("objective") as string;
   const preconditions = formData.get("preconditions") as string;
@@ -849,6 +881,7 @@
 }
 
 export async function createDefectWithTicket(formData: FormData) {
+  await assertUser();
   const title = formData.get("title") as string;
   const description = formData.get("description") as string;
   const severity = formData.get("severity") as string || "MEDIUM";
@@ -880,6 +913,7 @@
 }
 
 export async function updateDefect(formData: FormData) {
+  await assertUser();
   const id = formData.get("id") as string;
   const title = formData.get("title") as string;
   const description = formData.get("description") as string;
@@ -912,13 +946,16 @@
 }
 
 export async function uploadExecutionAttachment(formData: FormData) {
+  const user = await assertUser();
   const file = formData.get("file") as File;
   const testCaseId = formData.get("testCaseId") as string || undefined;
-  const uploadedById = formData.get("uploadedById") as string;
+  const uploadedById = user.id;
 
-  if (!file || !uploadedById) {
-    throw new Error("File and uploadedById are required");
+  if (!file) {
+    throw new Error("File is required");
   }
+  if (file.size > 10 * 1024 * 1024) throw new Error("File size exceeds 10MB limit");
+  if (testCaseId) await assertTestCaseRole(user, testCaseId, "TESTER");
 
   const bytes = await file.arrayBuffer();
   const buffer = Buffer.from(bytes);
@@ -931,7 +968,7 @@
     fs.mkdirSync(UPLOAD_DIR, { recursive: true });
   }
 
-  const filename = `${randomUUID()}-${file.name.replace(/\s+/g, "_")}`;
+  const filename = `${randomUUID()}-${safeFileName(file.name)}`;
   const filePath = path.join(UPLOAD_DIR, filename);
   fs.writeFileSync(filePath, buffer);
 
@@ -950,6 +987,7 @@
 }
 
 export async function aiGenerateTestPlan(formData: FormData) {
+  await assertUser();
   const projectId = formData.get("projectId") as string;
   const appUrl = formData.get("appUrl") as string;
   const codebase = formData.get("codebase") as string;
@@ -1016,6 +1054,7 @@
 }
 
 export async function createEnvironment(formData: FormData) {
+  await assertUser();
   "use server";
   const projectId = formData.get("projectId") as string;
   const name = formData.get("name") as string;
@@ -1037,6 +1076,7 @@
 }
 
 export async function createQualityGate(formData: FormData) {
+  await assertUser();
   "use server";
   const projectId = formData.get("projectId") as string;
   const name = formData.get("name") as string;
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/app/api/test/route.ts fix/src/app/api/test/route.ts
--- base/src/app/api/test/route.ts	2026-10-15 19:48:57.000000000 +0000
+++ fix/src/app/api/test/route.ts	1970-01-01 00:00:00.000000000 +0000
@@ -1,13 +0,0 @@
-import { prisma } from '@/lib/prisma';
-import { NextResponse } from 'next/server';
-
-export async function GET() {
-  try {
-    // Try to count the number of users
-    const userCount = await prisma.user.count();
-    return NextResponse.json({ message: 'Database connection successful', userCount });
-  } catch (error) {
-    console.error('Database connection error:', error);
-    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
-  }
-}
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/app/api/v1/ai/chat/route.ts fix/src/app/api/v1/ai/chat/route.ts
--- base/src/app/api/v1/ai/chat/route.ts	2026-10-16 07:18:07.000000000 +0000
+++ fix/src/app/api/v1/ai/chat/route.ts	2026-10-16 20:07:35.008572582 +0000
@@ -2,10 +2,17 @@
 import { json, error } from "@/lib/api-response";
 import { generateContent } from "@/lib/gemini";
 import type { GeminiMessage } from "@/lib/gemini";
+import { requireUser, accessibleProjectIds, scope } from "@/lib/api-auth";
+import { rateLimit } from "@/lib/auth";
 import { sanitizeInput, FIELD_LIMITS } from "@/lib/validation";
 
 export async function POST(req: Request) {
+  const auth = await requireUser();
+  if (!auth.ok) return auth.res;
+  const rl = rateLimit(`ai-chat:${auth.user.id}`, { limit: 20, windowMs: 60_000 });
+  if (!rl.allowed) return error("Too many AI requests. Please wait a minute.", 429);
   try {
+    const inProjects = scope(await accessibleProjectIds(auth.user));
     const { message, conversationHistory } = await req.json();
     if (!message || typeof message !== "string" || message.trim().length === 0) {
       return error("A non-empty message is required", 400);
@@ -14,13 +21,13 @@
     const cleanMessage = sanitizeInput(message.trim()).slice(0, FIELD_LIMITS.search);
 
     const [testCases, executions, defects] = await Promise.all([
-      prisma.testCase.count(),
-      prisma.testExecution.count(),
-      prisma.defect.count(),
+      prisma.testCase.count({ where: { projectId: inProjects } }),
+      prisma.testExecution.count({ where: { testCase: { projectId: inProjects } } }),
+      prisma.defect.count({ where: { testCase: { projectId: inProjects } } }),
     ]);
 
     const passedExecutions = await prisma.testExecution.count({
-      where: { status: "PASSED" },
+      where: { status: "PASSED", testCase: { projectId: inProjects } },
     });
     const passRate =
       executions > 0 ? Math.round((passedExecutions / executions) * 100) : 0;
@@ -66,6 +73,7 @@
 
     return json({ response: text });
   } catch (err) {
-    return error(err instanceof Error ? err.message : "AI assistant failed", 500);
+    console.error("ai-chat failed", err);
+    return error("The AI assistant is unavailable right now.", 500);
   }
 }
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/app/api/v1/attachments/[id]/route.ts fix/src/app/api/v1/attachments/[id]/route.ts
--- base/src/app/api/v1/attachments/[id]/route.ts	2026-10-15 22:24:49.000000000 +0000
+++ fix/src/app/api/v1/attachments/[id]/route.ts	2026-10-16 20:07:35.007919930 +0000
@@ -1,5 +1,6 @@
 import { prisma } from "@/lib/prisma";
 import { json, error } from "@/lib/api-response";
+import { requireUser, requireProjectRole } from "@/lib/api-auth";
 import { existsSync, readFileSync, statSync, unlinkSync } from "fs";
 
 export async function GET(
@@ -7,11 +8,19 @@
   { params }: { params: Promise<{ id: string }> },
 ) {
   try {
+    const auth = await requireUser();
+    if (!auth.ok) return auth.res;
     const { id } = await params;
-    const attachment = await prisma.attachment.findUnique({ where: { id } });
+    const attachment = await prisma.attachment.findUnique({ where: { id }, include: { testCase: { select: { projectId: true } } } });
     if (!attachment) {
       return error("Attachment not found", 404);
     }
+    if (attachment.testCase?.projectId) {
+      const perm = await requireProjectRole(auth.user, attachment.testCase.projectId, "VIEWER");
+      if (!perm.ok) return perm.res;
+    } else if (attachment.uploadedById !== auth.user.id && auth.user.role !== "ADMIN") {
+      return error("Attachment not found", 404);
+    }
     if (!existsSync(attachment.path)) {
       return error("Attachment file is unavailable", 410);
     }
@@ -23,6 +32,7 @@
       status: 200,
       headers: {
         "Content-Type": attachment.mimeType,
+        "X-Content-Type-Options": "nosniff",
         "Content-Length": String(stat.size),
         "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.originalName)}"`,
       },
@@ -37,11 +47,19 @@
   { params }: { params: Promise<{ id: string }> },
 ) {
   try {
+    const auth = await requireUser();
+    if (!auth.ok) return auth.res;
     const { id } = await params;
-    const attachment = await prisma.attachment.findUnique({ where: { id } });
+    const attachment = await prisma.attachment.findUnique({ where: { id }, include: { testCase: { select: { projectId: true } } } });
     if (!attachment) {
       return error("Attachment not found", 404);
     }
+    if (attachment.testCase?.projectId) {
+      const perm = await requireProjectRole(auth.user, attachment.testCase.projectId, "MANAGER");
+      if (!perm.ok) return perm.res;
+    } else if (attachment.uploadedById !== auth.user.id && auth.user.role !== "ADMIN") {
+      return error("Attachment not found", 404);
+    }
     await prisma.attachment.delete({ where: { id } });
     if (existsSync(attachment.path)) {
       unlinkSync(attachment.path);
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/app/api/v1/attachments/route.ts fix/src/app/api/v1/attachments/route.ts
--- base/src/app/api/v1/attachments/route.ts	2026-10-16 07:22:33.000000000 +0000
+++ fix/src/app/api/v1/attachments/route.ts	2026-10-16 20:07:35.007617739 +0000
@@ -3,11 +3,13 @@
 import { existsSync, mkdirSync, writeFileSync } from "fs";
 import { join } from "path";
 import { randomUUID } from "crypto";
+import { requireUser, requireProjectRole, accessibleProjectIds, scope, projectIdOfTestCase } from "@/lib/api-auth";
+import { safeFileName } from "@/lib/files";
 
 const UPLOAD_DIR = join(process.cwd(), "uploads");
 const MAX_FILE_SIZE = 10 * 1024 * 1024;
 const ALLOWED_EXTENSIONS = new Set([
-  ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp",
+  ".jpg", ".jpeg", ".png", ".gif", ".webp", // .svg removed: it can carry scripts
   ".pdf", ".json", ".zip", ".md", ".csv", ".txt",
   ".log", ".xml", ".yaml", ".yml",
 ]);
@@ -36,9 +38,13 @@
 }
 
 export async function GET() {
+  const auth = await requireUser();
+  if (!auth.ok) return auth.res;
   try {
     ensureUploadDir();
+    const ids = await accessibleProjectIds(auth.user);
     const attachments = await prisma.attachment.findMany({
+      where: ids === null ? {} : { OR: [{ uploadedById: auth.user.id }, { testCase: { projectId: scope(ids) } }] },
       orderBy: { createdAt: "desc" },
       take: 50,
       include: { uploadedBy: { select: { id: true, email: true, name: true } } },
@@ -50,18 +56,23 @@
 }
 
 export async function POST(req: Request) {
+  const auth = await requireUser();
+  if (!auth.ok) return auth.res;
   try {
     ensureUploadDir();
     const formData = await req.formData();
     const file = formData.get("file") as File | null;
     const testCaseId = (formData.get("testCaseId") as string) || undefined;
-    const uploadedById = (formData.get("uploadedById") as string) || undefined;
+    const uploadedById = auth.user.id; // from the session, not the form
 
     if (!file) {
       return error("No file provided", 400);
     }
-    if (!uploadedById) {
-      return error("uploadedById is required", 400);
+    if (testCaseId) {
+      const projectId = await projectIdOfTestCase(testCaseId);
+      if (!projectId) return error("Not found", 404);
+      const perm = await requireProjectRole(auth.user, projectId, "TESTER");
+      if (!perm.ok) return perm.res;
     }
     if (file.size > MAX_FILE_SIZE) {
       return error("File size exceeds 10MB limit", 413);
@@ -72,7 +83,7 @@
       return error(fileCheck, 400);
     }
 
-    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
+    const sanitizedName = safeFileName(file.name);
     const bytes = await file.arrayBuffer();
     const buffer = Buffer.from(bytes);
     const filename = `${randomUUID()}-${sanitizedName}`;
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/app/api/v1/defects/[defectId]/route.ts fix/src/app/api/v1/defects/[defectId]/route.ts
--- base/src/app/api/v1/defects/[defectId]/route.ts	2026-10-15 19:50:11.000000000 +0000
+++ fix/src/app/api/v1/defects/[defectId]/route.ts	2026-10-16 20:07:35.005611773 +0000
@@ -1,26 +1,47 @@
 import { prisma } from "@/lib/prisma";
 import { json, error } from "@/lib/api-response";
+import { sanitizeInput } from "@/lib/validation";
+import { requireUser, requireProjectRole, pick } from "@/lib/api-auth";
 
+type Ctx = { params: Promise<{ defectId: string }> };
+// Only these fields may be changed through the API (stops mass assignment of reporterId, testCaseId, id...).
+const EDITABLE = ["title", "description", "stepsToReproduce", "expectedResult", "actualResult", "severity", "priority", "status", "assigneeId", "environment", "build", "externalTicketId", "externalTicketUrl"] as const;
+const TEXT = new Set(["title", "description", "stepsToReproduce", "expectedResult", "actualResult", "environment", "build", "externalTicketId", "externalTicketUrl"]);
 
-export async function GET(
-  _req: Request,
-  { params }: { params: Promise<{ defectId: string }> }
-) {
-  const { defectId } = await params;
-  const defect = await prisma.defect.findUnique({ where: { id: defectId } });
+async function load(defectId: string) {
+  return prisma.defect.findUnique({ where: { id: defectId }, include: { testCase: { select: { projectId: true } } } });
+}
+
+export async function GET(_req: Request, { params }: Ctx) {
+  const auth = await requireUser();
+  if (!auth.ok) return auth.res;
+  const defect = await load((await params).defectId);
   if (!defect) return error("Defect not found", 404);
+  if (defect.testCase?.projectId) {
+    const perm = await requireProjectRole(auth.user, defect.testCase.projectId, "VIEWER");
+    if (!perm.ok) return perm.res;
+  } else if (defect.reporterId !== auth.user.id && auth.user.role !== "ADMIN") {
+    return error("Defect not found", 404);
+  }
   return json(defect);
 }
 
-export async function PATCH(
-  req: Request,
-  { params }: { params: Promise<{ defectId: string }> }
-) {
+export async function PATCH(req: Request, { params }: Ctx) {
+  const auth = await requireUser();
+  if (!auth.ok) return auth.res;
   try {
-    const body = await req.json();
-    const { defectId } = await params;
-    const defect = await prisma.defect.update({ where: { id: defectId }, data: body });
-    return json(defect);
+    const defect = await load((await params).defectId);
+    if (!defect) return error("Defect not found", 404);
+    if (defect.testCase?.projectId) {
+      const perm = await requireProjectRole(auth.user, defect.testCase.projectId, "TESTER");
+      if (!perm.ok) return perm.res;
+    } else if (defect.reporterId !== auth.user.id && auth.user.role !== "ADMIN") {
+      return error("Defect not found", 404);
+    }
+    const data = pick(await req.json(), EDITABLE);
+    for (const k of Object.keys(data)) if (TEXT.has(k) && typeof data[k] === "string") data[k] = sanitizeInput(data[k] as string);
+    const updated = await prisma.defect.update({ where: { id: defect.id }, data });
+    return json(updated);
   } catch {
     return error("Failed to update defect", 500);
   }
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/app/api/v1/defects/route.ts fix/src/app/api/v1/defects/route.ts
--- base/src/app/api/v1/defects/route.ts	2026-10-16 07:15:14.000000000 +0000
+++ fix/src/app/api/v1/defects/route.ts	2026-10-16 20:07:35.005468067 +0000
@@ -1,36 +1,54 @@
 import { prisma } from "@/lib/prisma";
 import { json, error, paginated } from "@/lib/api-response";
 import { sanitizeInput } from "@/lib/validation";
-
+import { requireUser, requireProjectRole, accessibleProjectIds, scope, projectIdOfTestCase } from "@/lib/api-auth";
 
 export async function GET(req: Request) {
+  const auth = await requireUser();
+  if (!auth.ok) return auth.res;
+
   const { searchParams } = new URL(req.url);
   const projectId = searchParams.get("projectId");
   const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
   const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
   const skip = (page - 1) * pageSize;
 
-  const where = projectId ? { testCase: { projectId } } : {};
+  let projectFilter;
+  if (projectId) {
+    const perm = await requireProjectRole(auth.user, projectId, "VIEWER");
+    if (!perm.ok) return perm.res;
+    projectFilter = projectId;
+  } else {
+    projectFilter = scope(await accessibleProjectIds(auth.user)); // only the caller's projects
+  }
+  const where = { testCase: { projectId: projectFilter } };
 
   const [items, total] = await Promise.all([
-    prisma.defect.findMany({ skip, take: pageSize, where, include: { testCase: true, testExecution: true } }),
+    prisma.defect.findMany({ skip, take: pageSize, where, orderBy: { createdAt: "desc" }, include: { testCase: true, testExecution: true } }),
     prisma.defect.count({ where }),
   ]);
-
   return paginated(items, page, pageSize, total);
 }
 
 export async function POST(req: Request) {
+  const auth = await requireUser();
+  if (!auth.ok) return auth.res;
   try {
-    const { title, description, testCaseId, reporterId, severity, priority, externalTicketId, externalTicketUrl } = await req.json();
-    if (!title || !reporterId) return error("Title and reporterId required", 400);
+    const { title, description, testCaseId, severity, priority, externalTicketId, externalTicketUrl } = await req.json();
+    if (!title) return error("Title is required", 400);
+    if (!testCaseId) return error("testCaseId is required", 400);
+
+    const projectId = await projectIdOfTestCase(String(testCaseId));
+    if (!projectId) return error("Not found", 404);
+    const perm = await requireProjectRole(auth.user, projectId, "TESTER");
+    if (!perm.ok) return perm.res;
 
     const defect = await prisma.defect.create({
       data: {
         title: sanitizeInput(String(title)),
         description: description ? sanitizeInput(String(description)) : undefined,
         testCaseId,
-        reporterId,
+        reporterId: auth.user.id, // from the session, not the request body
         severity,
         priority,
         externalTicketId: externalTicketId ? sanitizeInput(String(externalTicketId)) : null,
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/app/api/v1/me/route.ts fix/src/app/api/v1/me/route.ts
--- base/src/app/api/v1/me/route.ts	2026-10-15 19:48:57.000000000 +0000
+++ fix/src/app/api/v1/me/route.ts	2026-10-16 20:07:07.073889339 +0000
@@ -3,14 +3,14 @@
 import jwt from "jsonwebtoken";
 import { cookies } from "next/headers";
 
-const JWT_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
+import { getAuthSecret } from "@/lib/auth-secret";
 
 async function getUserFromRequest() {
   const cookieStore = await cookies();
   const token = cookieStore.get("session")?.value;
   if (!token) return null;
   try {
-    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
+    const payload = jwt.verify(token, getAuthSecret()) as { userId: string };
     return prisma.user.findUnique({ where: { id: payload.userId } });
   } catch {
     return null;
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/app/api/v1/test-cases/route.ts fix/src/app/api/v1/test-cases/route.ts
--- base/src/app/api/v1/test-cases/route.ts	2026-10-16 12:52:58.000000000 +0000
+++ fix/src/app/api/v1/test-cases/route.ts	2026-10-16 20:07:35.006522159 +0000
@@ -1,15 +1,25 @@
 import { prisma } from "@/lib/prisma";
 import { json, error, paginated } from "@/lib/api-response";
+import { requireUser, requireProjectRole, accessibleProjectIds, scope } from "@/lib/api-auth";
 import { sanitizeInput, validateKey, validateTitle, validatePriority, validateSeverity, validateStatus, validateTestType, validateTestLevel, validateAutomationStatus, validateTestEnvironment, FIELD_LIMITS } from "@/lib/validation";
 
 export async function GET(req: Request) {
+  const auth = await requireUser();
+  if (!auth.ok) return auth.res;
   const { searchParams } = new URL(req.url);
   const projectId = searchParams.get("projectId");
   const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
   const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
   const skip = (page - 1) * pageSize;
 
-  const where = projectId ? { projectId } : {};
+  let where;
+  if (projectId) {
+    const perm = await requireProjectRole(auth.user, projectId, "VIEWER");
+    if (!perm.ok) return perm.res;
+    where = { projectId };
+  } else {
+    where = { projectId: scope(await accessibleProjectIds(auth.user)) };
+  }
 
   const [items, total] = await Promise.all([
     prisma.testCase.findMany({
@@ -26,6 +36,8 @@
 }
 
 export async function POST(req: Request) {
+  const auth = await requireUser();
+  if (!auth.ok) return auth.res;
   try {
     const body = await req.json();
     const {
@@ -67,6 +79,8 @@
     if (!projectId) {
       return error("Project is required - create a project before adding test cases", 400);
     }
+    const perm = await requireProjectRole(auth.user, projectId, "TESTER");
+    if (!perm.ok) return perm.res;
     if (!ownerId) {
       return error("Owner is required", 400);
     }
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/app/api/v1/webhooks/github/route.ts fix/src/app/api/v1/webhooks/github/route.ts
--- base/src/app/api/v1/webhooks/github/route.ts	2026-10-15 19:48:57.000000000 +0000
+++ fix/src/app/api/v1/webhooks/github/route.ts	2026-10-16 20:07:35.008707097 +0000
@@ -1,5 +1,14 @@
-import { json } from "@/lib/api-response";
+import { json, error } from "@/lib/api-response";
+import { verifyGithubSignature } from "@/lib/github-signature";
 
-export async function POST() {
-  return json({ message: "GitHub webhook endpoint" });
+export async function POST(req: Request) {
+  const secret = process.env.GITHUB_WEBHOOK_SECRET;
+  if (!secret) return error("Webhook secret not configured", 503);
+  const raw = await req.text(); // signature is computed over the exact raw body
+  if (!verifyGithubSignature(raw, req.headers.get("x-hub-signature-256"), secret)) {
+    return error("Invalid signature", 401);
+  }
+  const event = req.headers.get("x-github-event");
+  // TODO: handle workflow_run / check_run / push events (dedupe on x-github-delivery).
+  return json({ received: true, event });
 }
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/lib/api-auth.ts fix/src/lib/api-auth.ts
--- base/src/lib/api-auth.ts	1970-01-01 00:00:00.000000000 +0000
+++ fix/src/lib/api-auth.ts	2026-10-16 20:07:07.072205067 +0000
@@ -0,0 +1,84 @@
+import { NextResponse } from "next/server";
+import { prisma } from "@/lib/prisma";
+import { getCurrentUser, type CurrentUser } from "@/lib/auth-utils";
+import { hasRole, type Role } from "@/lib/permissions";
+
+/**
+ * Result-style helpers for route handlers (no throw, so existing try/catch blocks
+ * cannot swallow a 401/403):
+ *
+ *   const auth = await requireUser();            if (!auth.ok) return auth.res;
+ *   const perm = await requireProjectRole(auth.user, projectId, "TESTER");
+ *                                                if (!perm.ok) return perm.res;
+ */
+type Fail = { ok: false; res: NextResponse };
+
+const fail = (message: string, status: number): Fail => ({
+  ok: false,
+  res: NextResponse.json({ error: message }, { status }),
+});
+
+/** Global platform admins bypass project membership. Everyone else needs a ProjectMember row. */
+const isPlatformAdmin = (user: CurrentUser) => user.role === "ADMIN";
+
+export async function requireUser(): Promise<{ ok: true; user: CurrentUser } | Fail> {
+  const user = await getCurrentUser(); // re-reads role from the DB, so demotions apply immediately
+  return user ? { ok: true, user } : fail("Authentication required", 401);
+}
+
+export async function requireProjectRole(
+  user: CurrentUser,
+  projectId: string,
+  min: Role,
+): Promise<{ ok: true; role: Role | "ADMIN" } | Fail> {
+  if (isPlatformAdmin(user)) return { ok: true, role: "ADMIN" };
+  const member = await prisma.projectMember.findUnique({
+    where: { userId_projectId: { userId: user.id, projectId } },
+    select: { role: true },
+  });
+  // 404 (not 403) so outsiders cannot probe which project IDs exist.
+  if (!member) return fail("Not found", 404);
+  const role = member.role.toUpperCase() as Role;
+  return hasRole(role, min) ? { ok: true, role } : fail("Insufficient permissions", 403);
+}
+
+/** null = unrestricted (platform admin); otherwise the project IDs this user belongs to. */
+export async function accessibleProjectIds(user: CurrentUser): Promise<string[] | null> {
+  if (isPlatformAdmin(user)) return null;
+  const rows = await prisma.projectMember.findMany({
+    where: { userId: user.id },
+    select: { projectId: true },
+  });
+  return rows.map((r) => r.projectId);
+}
+
+/** Prisma filter fragment: spread into a where clause, e.g. { projectId: scope(ids) }. */
+export const scope = (ids: string[] | null) => (ids === null ? undefined : { in: ids });
+
+export async function projectIdOfTestCase(testCaseId: string): Promise<string | null> {
+  const tc = await prisma.testCase.findUnique({ where: { id: testCaseId }, select: { projectId: true } });
+  return tc?.projectId ?? null;
+}
+
+/** Whitelist fields from an untrusted body (prevents mass assignment). */
+export function pick<T extends Record<string, unknown>>(body: T, allowed: readonly string[]) {
+  const out: Record<string, unknown> = {};
+  for (const k of allowed) if (body && k in body && body[k] !== undefined) out[k] = body[k];
+  return out;
+}
+
+// ---- Throwing variants for server actions ("use server"), which surface errors to the form ----
+export async function assertUser(): Promise<CurrentUser> {
+  const user = await getCurrentUser();
+  if (!user) throw new Error("Authentication required");
+  return user;
+}
+export async function assertProjectRole(user: CurrentUser, projectId: string, min: Role) {
+  const r = await requireProjectRole(user, projectId, min);
+  if (!r.ok) throw new Error(r.res.status === 403 ? "Insufficient permissions" : "Not found");
+}
+export async function assertTestCaseRole(user: CurrentUser, testCaseId: string, min: Role) {
+  const projectId = await projectIdOfTestCase(testCaseId);
+  if (!projectId) throw new Error("Not found");
+  await assertProjectRole(user, projectId, min);
+}
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/lib/auth-secret.ts fix/src/lib/auth-secret.ts
--- base/src/lib/auth-secret.ts	1970-01-01 00:00:00.000000000 +0000
+++ fix/src/lib/auth-secret.ts	2026-10-16 20:07:07.072041075 +0000
@@ -0,0 +1,12 @@
+/**
+ * Single source of truth for the session-signing secret.
+ * Never falls back to a guessable value in production.
+ */
+export function getAuthSecret(): string {
+  const secret = process.env.AUTH_SECRET;
+  if (secret && secret.length >= 32) return secret;
+  if (process.env.NODE_ENV === "production") {
+    throw new Error("AUTH_SECRET must be set to a random value of at least 32 characters.");
+  }
+  return secret || "dev-only-insecure-secret-do-not-use-in-production";
+}
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/lib/auth-utils.ts fix/src/lib/auth-utils.ts
--- base/src/lib/auth-utils.ts	2026-10-16 05:19:50.000000000 +0000
+++ fix/src/lib/auth-utils.ts	2026-10-16 20:07:07.073543842 +0000
@@ -2,7 +2,7 @@
 import { cookies } from "next/headers";
 import jwt from "jsonwebtoken";
 
-const JWT_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
+import { getAuthSecret } from "@/lib/auth-secret";
 
 export interface CurrentUser {
   id: string;
@@ -17,7 +17,7 @@
   if (!token) return null;
 
   try {
-    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role?: string };
+    const payload = jwt.verify(token, getAuthSecret()) as { userId: string; role?: string };
     const user = await prisma.user.findUnique({
       where: { id: payload.userId },
       select: { id: true, email: true, name: true, role: true },
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/lib/auth.ts fix/src/lib/auth.ts
--- base/src/lib/auth.ts	2026-10-16 04:09:24.000000000 +0000
+++ fix/src/lib/auth.ts	2026-10-16 20:07:07.073204108 +0000
@@ -4,7 +4,7 @@
 import { randomBytes } from "crypto";
 import { Prisma } from "@prisma/client";
 
-const JWT_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
+import { getAuthSecret } from "@/lib/auth-secret";
 const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
 
 // In-memory rate limiter (per identifier): { key: { count, resetAt } }
@@ -15,7 +15,7 @@
   role?: string,
   keepSignedIn = false,
 ) {
-  const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
+  const token = jwt.sign({ userId, role }, getAuthSecret(), { expiresIn: "7d" });
   const cookieStore = await cookies();
   cookieStore.set("session", token, {
     httpOnly: true,
@@ -90,4 +90,4 @@
   return undefined;
 }
 
-export { JWT_SECRET, SESSION_MAX_AGE };
+export { SESSION_MAX_AGE };
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/lib/files.ts fix/src/lib/files.ts
--- base/src/lib/files.ts	1970-01-01 00:00:00.000000000 +0000
+++ fix/src/lib/files.ts	2026-10-16 20:07:07.072137987 +0000
@@ -0,0 +1,8 @@
+import { basename } from "path";
+
+/** Strip directories and unsafe characters so a client filename can never escape the upload dir. */
+export function safeFileName(name: string): string {
+  const base = basename(String(name).replace(/\\/g, "/"));
+  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^\.+/, "").slice(0, 100);
+  return cleaned || "file";
+}
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/src/lib/github-signature.ts fix/src/lib/github-signature.ts
--- base/src/lib/github-signature.ts	1970-01-01 00:00:00.000000000 +0000
+++ fix/src/lib/github-signature.ts	2026-10-16 20:07:07.072321748 +0000
@@ -0,0 +1,9 @@
+import { createHmac, timingSafeEqual } from "crypto";
+
+/** Verify GitHub's X-Hub-Signature-256 header against the raw request body. */
+export function verifyGithubSignature(rawBody: string, header: string | null, secret: string | undefined): boolean {
+  if (!secret || !header?.startsWith("sha256=")) return false;
+  const expected = Buffer.from("sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex"));
+  const given = Buffer.from(header);
+  return expected.length === given.length && timingSafeEqual(expected, given);
+}
diff -ruN -x node_modules -x .next -x package-lock.json -x tsconfig.tsbuildinfo -x .env.local -x '*.log' base/tests/unit/route-auth-coverage.test.ts fix/tests/unit/route-auth-coverage.test.ts
--- base/tests/unit/route-auth-coverage.test.ts	1970-01-01 00:00:00.000000000 +0000
+++ fix/tests/unit/route-auth-coverage.test.ts	2026-10-16 20:07:46.841244632 +0000
@@ -0,0 +1,93 @@
+import { describe, it, expect } from "vitest";
+import { readFileSync, readdirSync, statSync } from "fs";
+import { join, relative } from "path";
+
+/**
+ * Ratchet: every API route must authenticate in the handler (defence in depth behind middleware).
+ * UNPROTECTED_BASELINE lists routes that still need work. It may only SHRINK:
+ *  - a new route without auth fails this test
+ *  - a baseline route that gains auth must be removed from the list
+ */
+const ROOT = join(process.cwd(), "src/app/api");
+const PUBLIC = [/^src\/app\/api\/v1\/auth\//, /^src\/app\/api\/health\//, /^src\/app\/api\/ready\//, /^src\/app\/api\/docs\//];
+const PROTECTED = /requireUser|getCurrentUser|verifyGithubSignature/;
+
+const UNPROTECTED_BASELINE = new Set([
+  "src/app/api/v1/ai/failure-analysis/route.ts",
+  "src/app/api/v1/ai/recommendations/[recommendationId]/feedback/route.ts",
+  "src/app/api/v1/ai/recommendations/route.ts",
+  "src/app/api/v1/ai/strategy-review/route.ts",
+  "src/app/api/v1/ai/test-case-drafts/route.ts",
+  "src/app/api/v1/audit-logs/route.ts",
+  "src/app/api/v1/automation-repositories/route.ts",
+  "src/app/api/v1/automation-scripts/route.ts",
+  "src/app/api/v1/ci-connections/[connectionId]/sync/route.ts",
+  "src/app/api/v1/ci-connections/route.ts",
+  "src/app/api/v1/imports/allure/route.ts",
+  "src/app/api/v1/imports/cypress/route.ts",
+  "src/app/api/v1/imports/junit/route.ts",
+  "src/app/api/v1/imports/playwright/route.ts",
+  "src/app/api/v1/imports/webdriverio/route.ts",
+  "src/app/api/v1/integrations/[integrationId]/route.ts",
+  "src/app/api/v1/integrations/[integrationId]/sync/route.ts",
+  "src/app/api/v1/integrations/route.ts",
+  "src/app/api/v1/me/route.ts",
+  "src/app/api/v1/organisations/[organisationId]/route.ts",
+  "src/app/api/v1/organisations/[organisationId]/settings/route.ts",
+  "src/app/api/v1/organisations/route.ts",
+  "src/app/api/v1/projects/[projectId]/activity/route.ts",
+  "src/app/api/v1/projects/[projectId]/test-cases/route.ts",
+  "src/app/api/v1/projects/route.ts",
+  "src/app/api/v1/reconciliation-queue/route.ts",
+  "src/app/api/v1/reconciliation/[suggestionId]/review/route.ts",
+  "src/app/api/v1/reports/route.ts",
+  "src/app/api/v1/requirements/[requirementId]/route.ts",
+  "src/app/api/v1/requirements/[requirementId]/test-cases/route.ts",
+  "src/app/api/v1/requirements/route.ts",
+  "src/app/api/v1/test-cases/[testCaseId]/automation-mappings/route.ts",
+  "src/app/api/v1/test-cases/[testCaseId]/route.ts",
+  "src/app/api/v1/test-cases/[testCaseId]/steps/route.ts",
+  "src/app/api/v1/test-cases/export/route.ts",
+  "src/app/api/v1/test-cases/import-ai-draft/route.ts",
+  "src/app/api/v1/test-executions/[executionId]/route.ts",
+  "src/app/api/v1/test-executions/route.ts",
+  "src/app/api/v1/test-plans/[testPlanId]/route.ts",
+  "src/app/api/v1/test-plans/route.ts",
+  "src/app/api/v1/test-runs/[testRunId]/route.ts",
+  "src/app/api/v1/test-runs/route.ts",
+  "src/app/api/v1/test-step-results/[stepResultId]/route.ts",
+  "src/app/api/v1/test-strategies/route.ts",
+]);
+
+function routes(dir: string): string[] {
+  return readdirSync(dir).flatMap((n) => {
+    const p = join(dir, n);
+    return statSync(p).isDirectory() ? routes(p) : n === "route.ts" ? [p] : [];
+  });
+}
+
+describe("API route authentication coverage", () => {
+  const files = routes(ROOT).map((p) => [relative(process.cwd(), p), readFileSync(p, "utf8")] as const);
+
+  it("has no new unauthenticated routes", () => {
+    const offenders = files
+      .filter(([rel]) => !PUBLIC.some((rx) => rx.test(rel)))
+      .filter(([, src]) => !PROTECTED.test(src))
+      .map(([rel]) => rel)
+      .filter((rel) => !UNPROTECTED_BASELINE.has(rel));
+    expect(offenders).toEqual([]);
+  });
+
+  it("keeps the baseline honest (remove entries once a route is protected)", () => {
+    const stale = files.filter(([rel, src]) => UNPROTECTED_BASELINE.has(rel) && PROTECTED.test(src)).map(([rel]) => rel);
+    expect(stale).toEqual([]);
+  });
+});
+
+describe("secrets", () => {
+  it("has no hardcoded session-secret fallback", () => {
+    const hits = [ "middleware.ts", "src/lib/auth.ts", "src/lib/auth-utils.ts", "src/app/api/v1/me/route.ts" ]
+      .filter((f) => readFileSync(join(process.cwd(), f), "utf8").includes("dev-secret-change-me"));
+    expect(hits).toEqual([]);
+  });
+});

Remaining unprotected routes
src/app/api/v1/ai/failure-analysis/route.ts
src/app/api/v1/ai/recommendations/[recommendationId]/feedback/route.ts
src/app/api/v1/ai/recommendations/route.ts
src/app/api/v1/ai/strategy-review/route.ts
src/app/api/v1/ai/test-case-drafts/route.ts
src/app/api/v1/audit-logs/route.ts
src/app/api/v1/automation-repositories/route.ts
src/app/api/v1/automation-scripts/route.ts
src/app/api/v1/ci-connections/[connectionId]/sync/route.ts
src/app/api/v1/ci-connections/route.ts
src/app/api/v1/imports/allure/route.ts
src/app/api/v1/imports/cypress/route.ts
src/app/api/v1/imports/junit/route.ts
src/app/api/v1/imports/playwright/route.ts
src/app/api/v1/imports/webdriverio/route.ts
src/app/api/v1/integrations/[integrationId]/route.ts
src/app/api/v1/integrations/[integrationId]/sync/route.ts
src/app/api/v1/integrations/route.ts
src/app/api/v1/me/route.ts
src/app/api/v1/organisations/[organisationId]/route.ts
src/app/api/v1/organisations/[organisationId]/settings/route.ts
src/app/api/v1/organisations/route.ts
src/app/api/v1/projects/[projectId]/activity/route.ts
src/app/api/v1/projects/[projectId]/test-cases/route.ts
src/app/api/v1/projects/route.ts
src/app/api/v1/reconciliation-queue/route.ts
src/app/api/v1/reconciliation/[suggestionId]/review/route.ts
src/app/api/v1/reports/route.ts
src/app/api/v1/requirements/[requirementId]/route.ts
src/app/api/v1/requirements/[requirementId]/test-cases/route.ts
src/app/api/v1/requirements/route.ts
src/app/api/v1/test-cases/[testCaseId]/automation-mappings/route.ts
src/app/api/v1/test-cases/[testCaseId]/route.ts
src/app/api/v1/test-cases/[testCaseId]/steps/route.ts
src/app/api/v1/test-cases/export/route.ts
src/app/api/v1/test-cases/import-ai-draft/route.ts
src/app/api/v1/test-executions/[executionId]/route.ts
src/app/api/v1/test-executions/route.ts
src/app/api/v1/test-plans/[testPlanId]/route.ts
src/app/api/v1/test-plans/route.ts
src/app/api/v1/test-runs/[testRunId]/route.ts
src/app/api/v1/test-runs/route.ts
src/app/api/v1/test-step-results/[stepResultId]/route.ts
src/app/api/v1/test-strategies/route.ts